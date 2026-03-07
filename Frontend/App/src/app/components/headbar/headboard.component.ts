import { Component, OnInit } from '@angular/core';
import {IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs} from "@ionic/angular/standalone";
import {Router} from "@angular/router";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-headboard',
  templateUrl: './headboard.component.html',
  styleUrls: ['./headboard.component.scss'],
  imports: [
    IonTabButton,
    IonIcon,
    IonLabel,
    IonTabBar,
    CommonModule,
    IonTabs
  ]
})
export class HeadboardComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }



  get currentRoute(): string {
    return this.router.url.replace('/', '');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
