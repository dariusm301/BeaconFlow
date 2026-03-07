import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {HeadboardComponent} from "../headbar/headboard.component";
import {Ticket, WaitingTimeResponse} from "../models/Ticket";
import {Dashboard} from "../services/dashboard";

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeadboardComponent],
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent {
  ticket: Ticket | null = null;
  wait: WaitingTimeResponse | null = null;
  constructor(private service: Dashboard) {}
  ngOnInit() {
    try {
      const ticketData = localStorage.getItem('currentTicket');
      if (ticketData) {
        this.ticket = JSON.parse(ticketData);
        if(this.ticket != null) {
          this.service.getWaitingTime(this.ticket.gate.toString(), this.ticket?.flight_number).subscribe({
            next: (response) => {
              this.wait = response;
              console.log('Waiting time response:', this.wait);
            },
            error: (err) => {
              console.error('Error fetching waiting time:', err);
            }
          });
        }
        console.log('Ticket loaded:', this.ticket);
      }
    } catch (e) {
      console.error('Error parsing ticket:', e);
      this.ticket = null;
    }

  }
}
