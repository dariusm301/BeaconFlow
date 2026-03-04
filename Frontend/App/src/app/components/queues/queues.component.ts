import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent {}
