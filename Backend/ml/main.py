import requests
import json

NGROK_URL_PREDICT = "https://thetic-jody-sandless.ngrok-free.dev/predict"
NGROK_URL_REGRESSION = "https://thetic-jody-sandless.ngrok-free.dev/regresion"

def extract_data(image_path):
    """
    Takes an image path, sends it to the Colab AI, and returns a JSON dictionary.
    usage in app: json_data = extract_data('photo.jpg')
    """
    try:
        with open(image_path, 'rb') as img_file:
            response = requests.post(NGROK_URL_PREDICT, files={'image': img_file})
            
        if response.status_code == 200:
            return response.json() 
        else:
            return {"status": "error", "message": f"Server returned {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}


# json_data = extract_data('f2687140-53be-479b-bc22-0a519128e3c3.jpg')
# print(json_data)


def predict_wait_time(features_dict):

    try:
        # folosim parametrul json= în loc de files=
        response = requests.post(NGROK_URL_REGRESSION, json=features_dict)
        
        if response.status_code == 200:
            return response.json() 
        else:
            return {"status": "error", "message": f"Server returned {response.status_code} - {response.text}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}


import datetime

def test_predict_wait_time():
    current_day = datetime.datetime.now().weekday()

    date_pentru_model = {
        "queue_length": 25,             # ESP32
        "minutes_to_departure": 120.5,  # dep - now
        "international": 1,             # DB (0 sau 1)
        "capacity": 100,                # DB
        "load_factor": 0.85,            # DB
        "day_of_week": current_day, 
        "stage": "security"             # "checkin", "security" sau "boarding"
    }
    
    print(f"\nCalculating time for: {date_pentru_model['stage']} (DAY: {date_pentru_model['day_of_week']})...")
    
    # predict_wait_time trimite acest dicționar ca JSON către ruta /regresion
    ml_result = predict_wait_time(date_pentru_model)
    
    if ml_result.get("status") == "success":
        minute = ml_result.get("estimated_wait_minutes")
        print(f"\nESTIMATED TIME: {minute} min!")
    else:
        print(f"EROARE ML: {ml_result}")

#test_predict_wait_time()