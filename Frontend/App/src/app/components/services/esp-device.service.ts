import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {ESP, MainESP} from '../models/esp-device.model';
import {HttpClient, HttpParams} from "@angular/common/http";


const URL ='http://10.147.58.108:8000'
@Injectable({
  providedIn: 'root'
})
export class EspDeviceService {

  constructor(private http: HttpClient) {
  }


  public getESPDevices(): Observable<ESP[]> {
    return this.http.get<ESP[]>(`${URL}/get-nodes`);
  }

  public addDevice(formData: ESP): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint', formData.checkpoint)
      .set('gate', formData.gate)
      .set('uuid', formData.uuid);

    return this.http.post(`${URL}/addNode`, null, { params });
  }

  public editDevice(oldCheckpoint: string, oldGate: number, formData: ESP): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint_query', oldCheckpoint)
      .set('gate_query', oldGate)
      .set('new_checkpoint', formData.checkpoint)
      .set('new_gate', formData.gate)
      .set('new_uuid', formData.uuid);

    return this.http.put(`${URL}/editNode`, null, { params });
  }

  public deleteDevice(checkpoint: string, gate: number): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint', checkpoint)
      .set('gate', gate);

    return this.http.delete(`${URL}/deleteNode`, { params });
  }

  public getMainESP(gateValue?: string): Observable<MainESP> {
    let params = new HttpParams().set('checkpoint', 'gateway');


    if (gateValue) {
      params = params.set('gate', gateValue);
    }
    return this.http.get<MainESP>(`${URL}/get-node/`, { params });
  }
}
