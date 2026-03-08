import logging
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
import time
import json
from datetime import datetime

from clients.redis_client import RedisClient
from clients.mongodb_client import MongoDBClient
from clients.influxdb_client import InfluxClient

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_DETECTION_TOPIC = os.getenv("REDIS_TOPIC_DETECTIONS")
REDIS_STATUS_TOPIC = os.getenv("REDIS_TOPIC_STATUS")

MONGODB_HOST = os.getenv("MONGODB_HOST")
MONGODB_PORT = os.getenv("MONGODB_PORT")
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_DATABASE_NODES = os.getenv("MONGODB_DATABASE_NODES")
MONGODB_DATABASE_COLLECTION_NODES = os.getenv("MONGODB_DATABASE_COLLECTION_NODES")
MONGODB_DATABASE_COLLECTION_FLIGHTS = os.getenv("MONGODB_DATABASE_COLLECTION_FLIGHTS")
MONGODB_DATABASE_COLLECTION_TRAINING = os.getenv("MONGODB_DATABASE_COLLECTION_TRAINING")


INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUDXDB_ORG = os.getenv("INFLUDXDB_ORG")
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

mongodbClient = MongoDBClient(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, 
                            MONGODB_DATABASE_NODES, MONGODB_DATABASE_COLLECTION_NODES)

mongodbClient_Flights = MongoDBClient(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, 
                            MONGODB_DATABASE_NODES, MONGODB_DATABASE_COLLECTION_FLIGHTS)

mongodbClient_Training = MongoDBClient(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, 
                            MONGODB_DATABASE_NODES, MONGODB_DATABASE_COLLECTION_TRAINING)

redis_client = RedisClient(REDIS_HOST, REDIS_PORT)

influx_client = InfluxClient(
    url=INFLUXDB_URL,
    token=INFLUXDB_TOKEN,
    org=INFLUDXDB_ORG,
    bucket=INFLUXDB_BUCKET
)


def status_info(data):
    data = json.loads(data)
    checkpoint = data.get("checkpoint")
    gate = data.get("gate")
    battery = None
    calibrated = None
    mac = None
    if checkpoint != "gateway":
        if '%' in data.get("status"):
            battery = data.get("status")
        else:
            calibrated = data.get("status")
        
        if calibrated != None:
            print(calibrated)
            if calibrated == "Stop":
                print(f"checkpoint: {checkpoint}; gate: {gate}")
                mongodbClient.update_data({"checkpoint": checkpoint, "gate": gate}, {"status": "Calibrated"})
            elif calibrated == "Error":
                print(f"checkpoint: {checkpoint}; gate: {gate}")
                mongodbClient.update_data({"checkpoint": checkpoint, "gate": gate}, {"status": "Error! Not Calibrated"})
        if battery != None:
            print(battery)
            print(f"checkpoint: {checkpoint}; gate: {gate}")
            mongodbClient.update_data({"checkpoint": checkpoint, "gate": gate}, {"battery": battery.split('%')[0]})
    else:
        mac = data.get("mac")
        result = mongodbClient.get_data({"checkpoint": "gateway"})
        if not result:
            print(f"checkpoint: {checkpoint}; gate: {gate}")
            mongodbClient.save_data({
                "checkpoint": "gateway",
                "mac": mac
            })
        elif result[0].get("mac") != mac:
            print(f"checkpoint: {checkpoint}; gate: {gate}")
            mongodbClient.update_data({"checkpoint": "gateway"}, {"mac": mac})
        

def _minutes_to_departure(flight: dict, now: datetime) -> float | None:
    dep_str = flight.get("departure_hhmm")  # e.g. "06:30" stored on flight doc
    if not dep_str:
        return None
    dep_h, dep_m = map(int, dep_str.split(":"))
    return round((dep_h * 60 + dep_m) - (now.hour * 60 + now.minute), 2)
        
def passenger_flow(data):
    print(f"data received on detections: {data}")
    data = json.loads(data)
    gate = data.get("gate")
    ticket_id = data.get("id")
    checkpoint = data.get("checkpoint")

    if checkpoint == "IN":
        queue_length = redis_client.incr(f"gate:{gate}:count")
        redis_client.set(f"gate:{gate}:{ticket_id}:entry_time", time.time())

        influx_client.write(
            measurement="passenger_flow",
            tags={
                "gate":  gate,
                "stage": "boarding",
            },
            fields={
                "queue_length": int(queue_length),
            }
        )

    elif checkpoint == "OUT":
        entry_time = redis_client.get(f"gate:{gate}:{ticket_id}:entry_time")

        if entry_time:
            service_sec     = time.time() - float(entry_time)
            actual_wait_min = service_sec / 60

            redis_client.delete(f"gate:{gate}:{ticket_id}:entry_time")
            redis_client.delete(f"gate:{gate}:queue")
            queue_length = redis_client.decr(f"gate:{gate}:count")

            influx_client.write(
                measurement="passenger_flow",
                tags={
                    "gate":  gate,
                    "stage": "boarding",
                },
                fields={
                    "queue_length":    int(queue_length),
                    "wait_min_actual": round(float(actual_wait_min), 2),
                }
            )

            # ── Training data ────────────────────────────────────────────
            flight = mongodbClient_Flights.get_data({"gate": int(gate)})
            boarded = redis_client.get(f"gate:{gate}:boarded_count")  # increment on each OUT
            if type(boarded) is str:
                load_factor_realtime = int(boarded) / flight.get("capacity")
            else: 
                load_factor_realtime = 0
            if flight:
                flight = flight[0]
                now = datetime.now()
                mongodbClient_Training.save_data({
                    "flight_id":            flight.get("flight_id"),
                    "destination":          flight.get("destination"),
                    "capacity":             flight.get("capacity"),
                    "load_factor":          load_factor_realtime,
                    "international":        flight.get("international"),
                    "day_of_week":          flight.get("day_of_week"),
                    "stage":                "boarding",
                    "arrival_hhmm":         now.strftime("%H:%M"),
                    "arrival_minutes":      round(now.hour * 60 + now.minute + now.second / 60, 2),
                    "minutes_to_departure": _minutes_to_departure(flight, now),
                    "queue_length":         int(queue_length),
                    "wait_min":             round(actual_wait_min, 4),
                    "service_sec":          round(service_sec, 2),
                })
            else:
                log.warning(f"No flight found for gate {gate}, training row skipped")
            # ─────────────────────────────────────────────────────────────

        else:
            log.warning(f"No entry time found for ticket {ticket_id} at gate {gate}")
    
redis_client.subscribe({
    REDIS_DETECTION_TOPIC: passenger_flow,
    REDIS_STATUS_TOPIC: status_info
})

while True:
    time.sleep(1)





