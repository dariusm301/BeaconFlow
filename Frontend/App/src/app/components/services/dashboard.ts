import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {WaitingTimeResponse} from "../models/Ticket";


const URL ='https://bflow.bitaxiom.tech'

@Injectable({
  providedIn: 'root',
})
export class Dashboard {


  constructor(private http: HttpClient) {
  }
  getWaitingTime(gate: string, flightNumber: string): Observable<WaitingTimeResponse> {

    const params = new HttpParams()
      .set('gate', gate)
      .set('flight_number', flightNumber);

    return this.http.get<WaitingTimeResponse>(`${URL}/waitingTime`, { params });
  }
}
