import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class Places {
  constructor(private http: HttpClient) {
  }
}
