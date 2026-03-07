import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import { Geolocation } from '@capacitor/geolocation';
@Injectable({
  providedIn: 'root',
})
export class Location {

  public isAtAirport = new BehaviorSubject<boolean>(false);

  private watchId: string | null = null;
  private readonly OMR_COORDS = { lat: 47.0253, lng: 21.9025 };
  private readonly RADIUS_KM = 0.5; // 500m radius

  constructor() {}

  async startMonitoring() {
    if (this.watchId) return;

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000
        },
        (position, err) => {
          if (position) {
            const dist = this.calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              this.OMR_COORDS.lat,
              this.OMR_COORDS.lng
            );

            const status = dist <= this.RADIUS_KM;


            if (this.isAtAirport.value !== status) {
              this.isAtAirport.next(status);
              console.log(status ? "Entered Oradea perimeter" : "Left perimeter");
            }
          }
        }
      );
    } catch (e) {
      console.error("Could not start monitoring", e);
    }
  }


  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
