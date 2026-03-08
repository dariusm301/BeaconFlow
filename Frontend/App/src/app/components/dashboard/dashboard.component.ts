import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {HeadboardComponent} from "../headbar/headboard.component";
import {Ticket, WaitingTimeResponse} from "../models/Ticket";
import {Dashboard} from "../services/dashboard";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeadboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router,private service: Dashboard) {
  }
  ticket: Ticket | null = null;
  wait: WaitingTimeResponse | null = null;

  public romanianAirportCodes: Record<string, string> = {
    'ORADEA': 'OMR',
    'BUCURESTI': 'OTP',
    'CLUJ-NAPOCA': 'CLJ',
    'PARIS': 'CDG',
    'STOCKHOLM': 'ARN',
  };

  getAirportCode(city: string): string {
    if (!city) return 'N/A';
    city = city.toUpperCase();
    return this.romanianAirportCodes[city] || city.substring(0, 3).toUpperCase();
  }

  ngOnInit() {
    try {
      const ticketData = localStorage.getItem('currentTicket');
      if (ticketData) {
        this.ticket = JSON.parse(ticketData);

        if (this.ticket != null) {

          const loadWaitingTime = () => {
            this.service.getWaitingTime(this.ticket!.gate.toString(), this.ticket!.flight_number).subscribe({
              next: (response) => {
                this.wait = response;
                console.log('Waiting time response:', this.wait);
              },
              error: (err) => {
                console.error('Error fetching waiting time:', err);
              }
            });
          };

          loadWaitingTime(); // primul request
          setInterval(loadWaitingTime, 10000); // la fiecare 10 secunde
        }

        console.log('Ticket loaded:', this.ticket);
      }
    } catch (e) {
      console.error('Error parsing ticket:', e);
      this.ticket = null;
    }
  }

  goToQueues() {
    this.router.navigate(['/queues']);
  }
}
