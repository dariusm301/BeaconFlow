import {Component, OnInit} from '@angular/core';
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
export class QueuesComponent implements OnInit {
  ticket: Ticket | null = null;
  wait: WaitingTimeResponse | null = null;
  constructor(private service: Dashboard) {}
  total_time: number = 13;

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
                this.total_time = 13 + (this.wait?.waiting_time.estimated_wait_minutes || 0);
                console.log('Waiting time response:', this.wait);
              },
              error: (err) => {
                console.error('Error fetching waiting time:', err);
              }
            });
          };

          loadWaitingTime(); // primul request
          setInterval(loadWaitingTime, 10000); // din 10 în 10 secunde
        }

        console.log('Ticket loaded:', this.ticket);
      }
    } catch (e) {
      console.error('Error parsing ticket:', e);
      this.ticket = null;
    }
  }
}
