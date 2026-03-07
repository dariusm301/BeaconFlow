import { Routes } from '@angular/router';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { QueuesComponent } from './components/queues/queues.component';
import { BaggageComponent } from './components/places/baggage.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import {AdminPageComponent} from "./components/admin-page/admin-page.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'onboarding',
    component: OnboardingComponent
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'queues',
    component: QueuesComponent
  },
  {
    path: 'places',
    component: BaggageComponent
  },
  {
    path: 'admin-page',
    component: AdminPageComponent
  }
];
