import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  arrowBackOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline,
  alertCircleOutline,
  airplaneOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  usernameFocused: boolean = false;
  passwordFocused: boolean = false;

  constructor(private router: Router) {
    addIcons({
      personOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      arrowBackOutline,
      eyeOutline,
      eyeOffOutline,
      logInOutline,
      alertCircleOutline,
      airplaneOutline
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async login() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;

    // setTimeout(() => {
    //   if (this.username === 'admin' && this.password === 'admin123') {
    //     localStorage.setItem('adminToken', 'admin-session-token');
    //     localStorage.setItem('adminUser', this.username);
    //     this.router.navigate(['/admin-page']);
    //   } else {
    //     this.errorMessage = 'Invalid username or password';
    //   }
    //   this.isLoading = false;
    // }, 1000);
    this.router.navigate(['dashboard']);
  }
}
