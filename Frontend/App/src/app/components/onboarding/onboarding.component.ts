import {Component, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, IonButton, IonInput, IonSpinner} from '@ionic/angular/standalone';
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
  constructor(private router: Router,private service: Onboarding) {}

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  state= "default"; // default or loading

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

  handleFileChange(){
    const file = this.fileInput.nativeElement.files?.[0];
    if(file){
      console.log('Selected file:', file);
      this.state = "loading";


      this.service.uploadTicket(file).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);

          console.log('Upload successful:', response);
        },
        error: (error) => {
          this.state= "default";
          this.selectedFile = null;

          console.error('Upload failed:', error);
        }
      }
      )
    }
  }
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        this.state = "loading";


        const blob = await this.base64FromPath(image.webPath);


        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });


        this.service.uploadTicket(file).subscribe({
          next: (response) => {
            console.log('Photo upload successful:', response);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.state = "default";
            console.error('Photo upload failed:', error);
          }
        });
      }

    } catch (error) {
      console.error('Camera error:', error);
    }
  }
  private async base64FromPath(path: string): Promise<Blob> {
    const response = await fetch(path);
    return await response.blob();
  }
}
