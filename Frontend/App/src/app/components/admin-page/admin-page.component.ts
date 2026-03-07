import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  bluetoothOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  settingsOutline,
  trashOutline,
  createOutline,
  refreshOutline,
  wifiOutline,
  locationOutline,
  enterOutline,
  exitOutline,
  saveOutline,
  closeOutline,
  hardwareChipOutline,
  syncOutline
} from 'ionicons/icons';
import {ESP,MainESP} from '../models/esp-device.model';
import { EspDeviceService } from '../services/esp-device.service';
import {HeadboardComponent} from "../headbar/headboard.component";

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton,  HeadboardComponent],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  devices: ESP[] = [];
  showAddForm: boolean = false;
  showEditForm: boolean = false;

  editingDevice: ESP | null = null;


  formData: ESP = {
    checkpoint: '',
    gate: '',
    uuid: '',
    calibrated : false,
    baterie_procent: "100"
  };

  mainESP : MainESP | null = null;
  oldCheck: string = '';
  oldGate: number = 0;

  constructor(
    private router: Router,
    private espService: EspDeviceService
  ) {
    addIcons({
      addOutline,
      arrowBackOutline,
      bluetoothOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      settingsOutline,
      trashOutline,
      createOutline,
      refreshOutline,
      wifiOutline,
      locationOutline,
      enterOutline,
      exitOutline,
      saveOutline,
      closeOutline,
      hardwareChipOutline,
      syncOutline
    });
  }

  ngOnInit(): void {
    this.espService.getMainESP().subscribe({
      next: (mainESP) => { this.mainESP = mainESP; console.log(mainESP) },
      error: (error) => { console.error('Failed to load main ESP data:', error) }
    })
    this.loadData()
  }

  loadData() : void {
    this.espService.getESPDevices().subscribe(devices => { this.devices = devices; console.log(devices); });
  }

  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  // }
  //

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
  //
  openAddForm(): void {
    this.resetForm();
    this.showAddForm = true;
    this.showEditForm = false;
  }

  openEditForm(device: ESP): void {
    this.oldGate = parseInt(device.gate);
    this.oldCheck = device.checkpoint
    this.editingDevice = device;
    this.formData = {
      checkpoint: device.checkpoint,
      gate: device.gate,
      uuid: device.uuid,
      calibrated: device.calibrated,
      baterie_procent: device.baterie_procent
    };
    this.showEditForm = true;
    this.showAddForm = false;
  }

  closeForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingDevice = null;
    this.resetForm();
  }
  //
  resetForm(): void {
    this.formData = {
     checkpoint: '',
      gate: '',
      uuid: '',
      calibrated: false,
      baterie_procent: "0"
    };
  }
  addDevice(): void {
    if (this.validateForm()) {
      this.espService.addDevice(this.formData).subscribe(
        {
          next: (response) => { this.devices.push({ uuid: this.formData.uuid,gate: this.formData.gate,checkpoint: this.formData.checkpoint , calibrated: false, baterie_procent: "100" }) },
          error: (error) => { console.error('Failed to add device:', error)
        }}
      );
      this.closeForm();
    }
  }
  //
  updateDevice(oldUuid: string, oldGate: number): void {
    if (this.editingDevice && this.validateForm()) {
      this.espService.editDevice(oldUuid,oldGate,this.formData).subscribe({
        next: () => {
          this.loadData();
          this.oldGate = 0;
          this.oldCheck = '';
        },
        error: (error) => { console.error('Failed to update device:', error) }
      })
      this.closeForm();
    }
  }

  deleteDevice(device: ESP): void {
    if (confirm(`Are you sure you want to delete "${device.checkpoint}"?`)) {
      this.espService.deleteDevice(device.checkpoint, parseInt(device.gate)).subscribe({
        next: () => {
          this.devices = this.devices.filter(d => !(d.checkpoint === device.checkpoint && d.gate === device.gate));
        },
        error: (error) => { console.error('Failed to delete device:', error)

      }
      });
    }
  }

  validateForm(): boolean {
    if (!this.formData.gate) {
      alert('Please enter a device name');
      return false;
    }
    if (!this.formData.uuid) {
      alert('Please enter the target UUID');
      return false;
    }
    return true;
  }
  //
  generateUUID(): void {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    this.formData.uuid = uuid.toUpperCase();
  }

  getStatusColor(calibrated: boolean): string {
    if(calibrated) {
      return '#4CAF50';
    }
    return '#F44336';
  }

  getStatusText(calibrated: boolean): string {
    if(calibrated) {
      return 'Online';
    }
    return 'Offline';
  }

  getCalibratedCount(): number {
    return this.devices.filter(d => d.calibrated).length;
  }

  getOnlineCount(): number {
    return this.devices.filter(d => d.calibrated).length;
  }

}
