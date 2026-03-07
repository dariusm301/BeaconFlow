import {Component, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, IonButton, IonSpinner} from '@ionic/angular/standalone';
import {Onboarding} from "../services/onboarding";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import {BleBeaconService} from "../services/ble-beacon.service";


@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton, IonSpinner],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  constructor(
    private router: Router,
    private service: Onboarding,
    private cdr: ChangeDetectorRef,
    private bleBeacon: BleBeaconService
  ) {}

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  state = 'default'; // 'default' or 'loading'
  selectedFile: File | null = null;

  simulateScan() {
    this.router.navigate(['/dashboard']);
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  loadFile(): void {
    this.fileInput.nativeElement.click();
  }

  handleFileChange() {
    const file = this.fileInput.nativeElement.files?.[0];
    if (file) {
      this.state = 'loading';
      this.cdr.detectChanges();

      this.service.uploadTicket(file).subscribe({
        next: (response) => {
          this.cdr.detectChanges();
          const ticketId = response?.ticket_id || response?.id || '';
          if (!ticketId) {
            console.warn('No ticket ID in upload response, BLE beacon will advertise service UUID only');
          }
          this.bleBeacon.startBeacon(ticketId);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Ticket upload failed:', error);
          this.state = 'default';
          this.selectedFile = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      if (image.webPath) {
        this.state = 'loading';
        this.cdr.detectChanges();

        const blob = await this.base64FromPath(image.webPath);
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        this.service.uploadTicket(file).subscribe({
          next: (response) => {
            this.cdr.detectChanges();
            const ticketId = response?.ticket_id || response?.id || '';
            if (!ticketId) {
              console.warn('No ticket ID in upload response, BLE beacon will advertise service UUID only');
            }
            this.bleBeacon.startBeacon(ticketId);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Ticket upload failed:', error);
            this.state = 'default';
            this.cdr.detectChanges();
          }
        });
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      this.state = 'default';
      this.selectedFile = null;
      this.cdr.detectChanges();
    }
  }

  private async base64FromPath(path: string): Promise<Blob> {
    const response = await fetch(path);
    return await response.blob();
  }
}
