# 🌊 BFlow: Intelligent Ecosystem for Predictive Passenger Flow Management
> **Turning Uncertainty into Predictability.**

BFlow is an end-to-end infrastructure solution that transforms physical environments into a live stream of data, anticipating bottlenecks before they impact the passenger experience.

[![Project Status: Active](https://img.shields.io/badge/Project%20Status-Active-brightgreen)](#)
[![Compliance: GDPR](https://img.shields.io/badge/Compliance-GDPR%20Compliant-blue)](#)
[![Tech: IoT/ML](https://img.shields.io/badge/Tech-IoT%20%7C%20ML%20%7C%20CV-orange)](#)

---

## 🌟 The Vision
The greatest challenge in managing crowded public spaces is the **"invisibility"** of its dynamics. BFlow eliminates reactive management by providing a window into the future—monitoring not just current congestion, but predicting flow patterns using IoT sensors and Machine Learning.

## 🚀 Key Features
* **Non-Invasive Tracking:** Anonymous Bluetooth detection (camera-free).
* **Predictive Brain:** Real-time waiting time estimation.
* **Contextual Intelligence:** OCR-driven boarding pass digitalization for flight-specific flow analysis.
* **Ultra-Low Power:** Built on ESP32 nodes using the ESP-NOW protocol.
* **Privacy by Design:** 100% GDPR compliant through hardware ID anonymization.
* **Hyper-Local Engagement:** Dynamic terminal maps and personalized duty-free recommendations based on real-time location.

---

## 🛠 Technology Stack

### IoT & Hardware
* **Microcontrollers:** ESP32 nodes.
* **Networking:** ESP-NOW (Private mesh network).
* **Signal Processing:** Kalman Filter implementation for signal smoothing and proximity accuracy.

### Computer Vision & ML
* **Boarding Pass Processing:** YOLOv8nano + EasyOCR for instant data extraction.
* **Predictive Modeling:** Random Forest Regressor.
    * **Performance:** $R^2 = 0.97$
    * **Accuracy:** $MAE = 3.6$ min

### Mobile & Cloud
* **Android Integration:** Google Geofencing API for automated Bluetooth activation.
* **Data Pipeline:** Real-time correlation between sensor density and flight capacity/urgency.

---

## 🏗 System Architecture

1.  **Sensing:** ESP32 nodes detect anonymous Bluetooth signals and estimate proximity.
2.  **Contextualizing:** Boarding passes are scanned to link real-time density with flight specifics (capacity, gate urgency).
3.  **Predicting:** The ML model correlates sensor data with ticket context to forecast bottlenecks.
4.  **Acting:** Real-time alerts are issued for proactive staff deployment and passenger notifications.

---

## ⚖ Ethics & Privacy
Privacy is our core priority. BFlow adheres to **Privacy by Design** principles:
* **No PII:** We do not store facial data, names, or personal identities.
* **Geofencing:** Tracking is strictly limited to the terminal perimeter.
* **Anonymization:** All processing is performed on hashed hardware IDs.
* **Compliance:** Full GDPR alignment from the hardware layer up.

---

## 👥 Team Members

| Member | Role |
| :--- | :--- |
| **Balahura Vlad** | Frontend Dev & UI/UX Designer |
| **Hordoan Darius** | Full-Stack Engineer & System Integration |
| **Halit Silviu** | Bluetooth & Hardware Engineer |
| **Moga Antonia** | ML Engineer & Product Strategy |
| **Stelea Sonia** | Backend Dev & Hardware Engineer |
| **Oniceag Diana** | Data & API Engineer |

---
