import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {HeadboardComponent} from "../headbar/headboard.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeadboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router) {
  }
  ngOnInit() {
  }

  goToQueues() {
    this.router.navigate(['/queues']);
  }
}
