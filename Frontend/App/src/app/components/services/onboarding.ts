import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";


const URL = 'http://10.147.58.108:8000';
@Injectable({
  providedIn: 'root',
})
export class Onboarding {
  constructor(private http: HttpClient) {
  }


  public uploadTicket(file: File): Observable<any> {
    const formData = new FormData();

    formData.append('ticket_file', file);

    return this.http.post(`${URL}/ticketdata`, formData);
  }
}
