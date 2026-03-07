import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs"; // Importul corectat pentru RxJS
import { AirportFacility, AirportResponse } from "../models/places";


const URL = 'https://bflow.bitaxiom.tech';

@Injectable({
  providedIn: 'root',
})
export class Places {
  constructor(private http: HttpClient) {}

  getFacilities(): Observable<AirportFacility[]> {
    return this.http.get<AirportResponse>(`${URL}/aeroport/Oradea_Aiport`).pipe(
      map((response: AirportResponse) => response.data)
    );
  }
}
