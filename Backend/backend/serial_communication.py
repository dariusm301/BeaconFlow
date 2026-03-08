import serial
import logging
import time
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
from clients.redis_client import RedisClient
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

load_dotenv()

PORT_HUB = os.getenv("PORT_HUB", "/dev/ttyUSB0")
BAUD_RATE = int(os.getenv("BAUD_RATE", 115200))

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_DETECTION_TOPIC = os.getenv("REDIS_TOPIC_DETECTIONS")
REDIS_STATUS_TOPIC = os.getenv("REDIS_TOPIC_STATUS")


def main():
    try:
        ser = serial.Serial(PORT_HUB, BAUD_RATE, timeout=0.1)
        log.info(f"[*] Sistem pornit. Ascult pe {PORT_HUB}...")
        
        try:
            redis_client = RedisClient(REDIS_HOST, REDIS_PORT)
        except Exception as e:
            log.error(f"Nu am putut conecta la brokerul Redis: {e}")
            return
        
        ser.write(b'S')
        log.info("Trying to get the MAC address of the ESP...")
    
        
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip() 
                if line.startswith("MAC"):
                    mac_address = line.split(" ")[1].strip()
                    print(mac_address)
                    redis_client.publish(
                        REDIS_STATUS_TOPIC,
                        json.dumps({
                            "checkpoint": "gateway",
                            "mac": mac_address
                        })
                    )
                if line.startswith("Checkpoint:"):
                    checkpoint = line.split(":")[1].strip()
                    print(f"Received message from checkpoint: {checkpoint}")
                if line.startswith("GATE"):
                    print(line)
                    gate = line.split(":")[1].strip()
                if line.startswith("Ticket:") and checkpoint and gate:
                    ticket_id = line.split(":")[1].strip()
                    print(f"Received ticket id: {ticket_id}")
                    redis_client.publish(
                        REDIS_DETECTION_TOPIC,
                        json.dumps({
                            "checkpoint": checkpoint,
                            "gate": gate,
                            "id": ticket_id
                        })
                    )
                    checkpoint = None
                if line.startswith("Status:") and checkpoint and gate:
                    status = line.split(":")[1].strip() if ":" in line else line
                    print(f"Received status: {status}")
                    redis_client.publish(
                        REDIS_STATUS_TOPIC,
                        json.dumps({
                            "checkpoint": checkpoint,
                            "gate": gate,
                            "status": status
                        })
                    )
                    checkpoint = None


    except serial.SerialException as e:
        log.error(f"Eroare la deschiderea portului serial: {e}")
        time.sleep(5)
    except Exception as e:
        log.error(f"Eroare: {e}")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

if __name__ == "__main__":
    main()