from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import redis
from dotenv import load_dotenv
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import logging
from clients.mongodb_client import MongoDBClient
import json
import google.generativeai as genai
from ml.main import extract_data, predict_wait_time
from typing import Optional
from datetime import datetime


app = FastAPI()

load_dotenv()

MONGODB_HOST = os.getenv("MONGODB_HOST")
MONGODB_PORT = os.getenv("MONGODB_PORT")
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_DATABASE_NODES = os.getenv("MONGODB_DATABASE_NODES")
MONGODB_DATABASE_COLLECTION_NODES = os.getenv("MONGODB_DATABASE_COLLECTION_NODES")
MONGODB_DATABASE_COLLECTION_FLIGHTS = os.getenv("MONGODB_DATABASE_COLLECTION_FLIGHTS")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_DETECTION_TOPIC = os.getenv("REDIS_TOPIC_DETECTIONS")
REDIS_STATUS_TOPIC = os.getenv("REDIS_TOPIC_STATUS")


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

mongodbClient_nodes = MongoDBClient(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, 
                            MONGODB_DATABASE_NODES, MONGODB_DATABASE_COLLECTION_NODES)

mongodbClient_flights = MongoDBClient(MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD, 
                            MONGODB_DATABASE_NODES, MONGODB_DATABASE_COLLECTION_FLIGHTS)


redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:8100", "http://localhost:8100", "https://bflow.bitaxiom.tech"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Beacon": "Here to help you find your way!"}

@app.post("/ticketdata")
async def receive_ticket_data(ticket_file: UploadFile = File(...)):
    content = await ticket_file.read()
    tmp_path = f"/tmp/{ticket_file.filename}"
    try:
        with open(tmp_path, "wb") as tmp_file:
            tmp_file.write(content)
        json_data = extract_data(tmp_path)
        ticket_data = json_data['data']

        flight_data = mongodbClient_flights.get_data({'flight_number': ticket_data['flight_number']})[0]
        if not flight_data:
            return {"Error": "Flight not found"}
        counter = redis_client.incr(f"ticket_counter:{flight_data.get('gate')}")
        ticket_id = f"ID{counter:03d}"
        print(flight_data['gate'])
        uuid = mongodbClient_nodes.get_data({'checkpoint': 'IN', 'gate': f"{flight_data['gate']}"})[0]
        if not uuid:
            return {"Error": "Node not found"} 
        print(uuid)
        res = {
            'arrival_airport' : ticket_data['arrival_airport'],
            'departure_airport' : ticket_data['departure_airport'],
            'flight_number' : ticket_data['flight_number'],
            'departure_time' : flight_data['departure_time'],
            'gate': flight_data.get('gate'),
            'uuid': uuid.get('uuid'),
            'ticket_id': ticket_id

        }
        return res
    except Exception as e:
        log.error(f"Ticket scanning error: {e}")
    finally:
         if os.path.exists(tmp_path):
            os.remove(tmp_path)  

@app.post("/addNode")
def addNode(checkpoint, gate, uuid): 
    return mongodbClient_nodes.save_data(
        {
            "checkpoint": checkpoint,
            "gate": gate,
            "uuid": uuid,
            "calibrated": 0,
            "battery": "100"
        }
    ) 
    
@app.get("/get-nodes")
def get_nodes():
    return mongodbClient_nodes.get_all()

@app.get("/get-node")
def get_node(checkpoint, gate : Optional[str] = None ):
    if gate != None:
        return mongodbClient_nodes.get_data(
            {
                "checkpoint": checkpoint,
                "gate": gate
            }
        )
    else:
        return mongodbClient_nodes.get_data(
            {
                "checkpoint": checkpoint
            }
        )

def _minutes_to_departure(flight: dict, now: datetime) -> float | None:
    dep_str = flight.get("departure_hhmm")  # e.g. "06:30" stored on flight doc
    if not dep_str:
        return None
    dep_h, dep_m = map(int, dep_str.split(":"))
    return round((dep_h * 60 + dep_m) - (now.hour * 60 + now.minute), 2)

@app.get("/waitingTime")
def getWaitingTime(gate, flight_number):
    
    current_day = datetime.now().weekday()
    flight_data = mongodbClient_flights.get_data({'flight_number': flight_number})[0]
    
    queque_length = redis_client.get(f"gate:{gate}:count")
    if queque_length is None:
        queque_length = 0
        redis_client.set(f"gate:{gate}:count", 0)
    print(queque_length)
    boarded = redis_client.get(f"gate:{gate}:boarded_count")
    if boarded is None:
        boarded = 0
    return {
        'queue_length': queque_length,
        'waiting_time': predict_wait_time({
            "queue_length": queque_length,
            "minutes_to_departure": _minutes_to_departure(flight_data, datetime.now()),
            "international": flight_data['international'],            
            "capacity": flight_data['capacity'],             
            "load_factor": boarded / flight_data['capacity'],          
            "day_of_week": current_day, 
            "stage": "boarding"             # "checkin", "security" sau "boarding"
        })
    }

@app.put("/editNode")
def editNode(checkpoint_query, gate_query, new_checkpoint, new_gate, new_uuid):
    return mongodbClient_nodes.update_data(
        {'checkpoint': checkpoint_query, 'gate': gate_query},
        {'checkpoint': new_checkpoint, 'gate': new_gate, 'uuid': new_uuid}
    )

@app.delete("/deleteNode")
def deleteNode(checkpoint, gate):
    return mongodbClient_nodes.delete_data(
        {
            'checkpoint': checkpoint,
            'gate': gate 
        }
    )

@app.get("/centralESP")
def getCentralESP():
    return mongodbClient_nodes.get_data({"checkpoint": "gateway"})

@app.get("/aeroport/{nume_aeroport}")
async def obtine_facilitati(nume_aeroport: str):
    prompt = f"""
        Provide the list of amenities, shops, and restaurants for the {nume_aeroport} airport. You must include the approximate latitude and longitude for EACH specific place in the list.
        You must return ONLY a valid JSON object in English, without any markdown formatting or extra text. Use the exact following structure:
        {{
            "airport_searched": "{nume_aeroport}",
            "status": "success",
            "data": [
                {{
                    "name": "Name of the place",
                    "latitude": 47.0258,
                    "longitude": 21.9031,
                    "average_price": "estimated price range, e.g., '5-10 EUR/meal'",
                    "stars": 4.5,
                    "type": "category, e.g., 'food', 'coffee', 'shop', 'lounge'",
                    "location": "landmark or location in the airport, e.g., 'Departures Terminal, near Gate 2'",
                    "facilities": ["wifi", "drinks", "food", "printer", "outlets", "to-go"]
                }}
            ]
        }}
        """

    try:
        response = model.generate_content(prompt)
        text_ai = response.text.strip()

        if text_ai.startswith("```json"):
            text_ai = text_ai[7:-3].strip()
        elif text_ai.startswith("```"):
            text_ai = text_ai[3:-3].strip()

        date_json = json.loads(text_ai)

        return date_json

    except Exception as e:
        return {
            "airport_searched": nume_aeroport,
            "status": "error",
            "message": str(e)
        }