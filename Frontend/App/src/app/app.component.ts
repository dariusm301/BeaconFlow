import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import {exit} from "ionicons/icons";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router) {}

  get showTabs(): boolean {
    return !this.router.url.includes('onboarding');
  }

  get currentRoute(): string {
    return this.router.url.replace('/', '');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  protected readonly exit = exit;
}
