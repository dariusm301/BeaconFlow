import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {HeadboardComponent} from "../headbar/headboard.component";

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeadboardComponent],
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent {}
