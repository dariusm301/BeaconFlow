import { Routes } from '@angular/router';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { QueuesComponent } from './components/queues/queues.component';
import { BaggageComponent } from './components/baggage/baggage.component';

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
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'queues',
    component: QueuesComponent
  },
  {
    path: 'baggage',
    component: BaggageComponent
  }
];
