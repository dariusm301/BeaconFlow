import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {ESP, MainESP} from '../models/esp-device.model';
import {HttpClient, HttpParams} from "@angular/common/http";


const URL ='https://bflow.bitaxiom.tech'
@Injectable({
  providedIn: 'root'
})
export class EspDeviceService {

  constructor(private http: HttpClient) {
  }


  public getESPDevices(): Observable<ESP[]> {
    return this.http.get(`${URL}/get-nodes`, { responseType: 'text' }).pipe(
      map((response: string) => {
        console.log('getESPDevices raw response type:', typeof response, 'value:', response?.substring?.(0, 200));
        let data: any = response;
        // Parse if string
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { console.error('Parse error:', e); data = []; }
        }
        // Capacitor native HTTP sometimes wraps in { data: ... }
        if (data && !Array.isArray(data) && data.data) {
          data = data.data;
        }
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { data = []; }
        }
        return Array.isArray(data) ? data : [];
      })
    );
  }

  public addDevice(formData: ESP): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint', formData.checkpoint)
      .set('gate', formData.gate)
      .set('uuid', formData.uuid);

    return this.http.post(`${URL}/addNode`, null, { params, responseType: 'text' });
  }

  public editDevice(oldCheckpoint: string, oldGate: number, formData: ESP): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint_query', oldCheckpoint)
      .set('gate_query', oldGate)
      .set('new_checkpoint', formData.checkpoint)
      .set('new_gate', formData.gate)
      .set('new_uuid', formData.uuid);

    return this.http.put(`${URL}/editNode`, null, { params, responseType: 'text' });
  }

  public deleteDevice(checkpoint: string, gate: number): Observable<any> {

    const params = new HttpParams()
      .set('checkpoint', checkpoint)
      .set('gate', gate);

    return this.http.delete(`${URL}/deleteNode`, { params, responseType: 'text' });
  }

  public getMainESP(gateValue?: string): Observable<MainESP> {
    let params = new HttpParams().set('checkpoint', 'gateway');


    if (gateValue) {
      params = params.set('gate', gateValue);
    }
    return this.http.get(`${URL}/get-node/`, { params, responseType: 'text' }).pipe(
      map((response: string) => {
        console.log('getMainESP raw response type:', typeof response, 'value:', response?.substring?.(0, 200));
        let data: any = response;
        // Parse if string
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { data = {}; }
        }
        // Capacitor native HTTP sometimes wraps in { data: ... }
        if (data && !Array.isArray(data) && data.data) {
          data = data.data;
        }
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { data = {}; }
        }
        const item = Array.isArray(data) ? data[0] : data;
        return {
          checkpoint: item?.checkpoint || '',
          mac: item?.mac || item?.uuid || ''
        } as MainESP;
      })
    );
  }

  public  getMain() : Observable<any> {
     return this.http.get<any>(`${URL}/centralESC`)
  }
}
