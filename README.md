BFlow: Intelligent Ecosystem for Predictive Passenger Flow Management
Turning Uncertainty into Predictability.

BFlow is an end-to-end infrastructure solution that transforms physical environments into a live stream of data, anticipating bottlenecks before they impact the passenger experience.

🌟 The Vision
The greatest challenge in managing crowded public spaces is the "invisibility" of its dynamics. BFlow eliminates reactive management by providing a window into the future—monitoring not just current congestion, but predicting flow patterns using IoT sensors and Machine Learning.

🚀 Key Features
•	Non-Invasive Tracking: Anonymous Bluetooth detection (no cameras).
•	Predictive Brain: Real-time waiting time estimation using Random Forest Regressors.
•	Contextual Intelligence: OCR-driven boarding pass digitalization for flight-specific flow analysis.
•	Ultra-Low Power: Built on ESP32 nodes using the ESP-NOW protocol.
•	Privacy by Design: 100% GDPR compliant through hardware ID anonymization.
•	Hyper-Local Engagement: Dynamic airport-specific content, including terminal and facilities maps, and personalized duty-free recommendations based on the user's current location.

🛠 Technology Stack

•	IoT & Hardware: ESP32 nodes using ESP-NOW (Private mesh network) + Kalman Filter for signal smoothing.
•	Computer Vision: YOLOv8nano + EasyOCR for instant boarding pass data extraction.
•	Machine Learning: Random Forest Regressor ($R2 = 0.97$, MAE = 3.6 min).
•	Mobile (Android): Google Geofencing API for destination-based Bluetooth automation.

🏗 System Architecture
•	Sensing: ESP32 nodes detect anonymous Bluetooth signals and estimate proximity.
•	Contextualizing: Boarding passes are scanned to link real-time density with flight specifics (capacity, urgency).
•	Predicting: The ML model correlates sensor data with ticket context to forecast bottlenecks.
•	Acting: Real-time alerts are issued for proactive staff deployment and passenger notifications.

⚖ Ethics & Privacy
Privacy is our core priority. BFlow does not:
•	Store facial data or names.
•	Track individuals outside the terminal perimeter.
•	Connect hardware IDs to personal identities.
All processing is done on anonymous hardware IDs, ensuring full GDPR compliance.

👥 Team members
•	Balahura Vlad – Frontend Dev & UI/UX Designer
•	Hordoan Darius – Full-Stack Engineer & System Integration
•	Halit Silviu – Bluetooth & Hardware Engineer 
•	Moga Antonia – ML Engineer & Product Strategy
•	Stelea Sonia – Backend Dev & Hardware Engineer
•	Oniceag Diana – Data & API Engineer 


