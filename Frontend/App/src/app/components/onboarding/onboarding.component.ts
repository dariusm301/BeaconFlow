import {Component, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, IonButton, IonSpinner} from '@ionic/angular/standalone';
import {Onboarding} from "../services/onboarding";
import {HeadboardComponent} from "../headbar/headboard.component";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";


@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton, IonSpinner],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  constructor(private router: Router, private service: Onboarding, private cdr: ChangeDetectorRef) {}

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  state= "default"; // default or loading
  debugLog: string = '';

  selectedFile : File | null = null;



  simulateScan() {
    this.router.navigate(['/dashboard']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  loadFile() : void  {

    this.fileInput.nativeElement.click();

  }

  handleFileChange() {
    const file = this.fileInput.nativeElement.files?.[0];
    if (file) {
      this.debugLog = 'File selected: ' + file.name + ' (' + file.size + ' bytes)';
      this.state = "loading";
      this.cdr.detectChanges();

      this.debugLog += ' | Calling uploadTicket...';
      this.cdr.detectChanges();

      this.service.uploadTicket(file).subscribe({
        next: (response) => {
          this.debugLog += ' | SUCCESS: ' + JSON.stringify(response).substring(0, 100);
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.debugLog += ' | ERROR: ' + (error?.message || JSON.stringify(error).substring(0, 100));
          this.state = "default";
          this.selectedFile = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async takePhoto() {
    try {
      this.debugLog = 'Opening camera...';
      this.cdr.detectChanges();

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      if (image.webPath) {
        this.debugLog += ' | Photo taken, converting...';
        this.state = "loading";
        this.cdr.detectChanges();

        const blob = await this.base64FromPath(image.webPath);
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        this.debugLog += ' | File created: ' + file.size + ' bytes | Uploading...';
        this.cdr.detectChanges();

        this.service.uploadTicket(file).subscribe({
          next: (response) => {
            this.debugLog += ' | SUCCESS: ' + JSON.stringify(response).substring(0, 100);
            this.cdr.detectChanges();
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.debugLog += ' | ERROR: ' + (error?.message || JSON.stringify(error).substring(0, 100));
            this.state = "default";
            this.cdr.detectChanges();
          }
        });
      }

    } catch (error: any) {
      this.debugLog += ' | CAMERA ERROR: ' + (error?.message || error);
      this.cdr.detectChanges();
    }
  }
  private async base64FromPath(path: string): Promise<Blob> {
    const response = await fetch(path);
    return await response.blob();
  }
}
