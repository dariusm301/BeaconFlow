import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {IonContent, IonIcon, IonButton, IonSpinner} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
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
import {forkJoin} from 'rxjs';
import {ESP, MainESP} from '../models/esp-device.model';
import {EspDeviceService} from '../services/esp-device.service';
import {HeadboardComponent} from "../headbar/headboard.component";

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton, IonSpinner, HeadboardComponent],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  devices: ESP[] = [];
  showAddForm: boolean = false;
  showEditForm: boolean = false;
  isLoading: boolean = true;

  editingDevice: ESP | null = null;


  formData: ESP = {
    checkpoint: '',
    gate: '',
    uuid: '',
    calibrated: false,
    battery: "100"
  };

  mainESP: MainESP | null = null;
  oldCheck: string = '';
  oldGate: number = 0;

  constructor(
    private router: Router,
    private espService: EspDeviceService,
    private cdr: ChangeDetectorRef
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
    this.isLoading = true;

    forkJoin({
      mainESP: this.espService.getMainESP(),
      devices: this.espService.getESPDevices()
    }).subscribe({
      next: (result) => {
        this.mainESP = result.mainESP;
        let devices: any = result.devices;
        if (typeof devices === 'string') {
          try {
            devices = JSON.parse(devices);
          } catch (e) { /* ignore */
          }
        }
        this.devices = Array.isArray(devices) ? [...devices] : [];
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Failed to load data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.espService.getESPDevices().subscribe({
      next: (rawDevices) => {
        let devices: any = rawDevices;
        if (typeof devices === 'string') {
          try {
            devices = JSON.parse(devices);
          } catch (e) { /* ignore */
          }
        }
        this.devices = Array.isArray(devices) ? [...devices] : [];
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('Failed to load devices:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


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
      battery: device.battery
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
      battery: "0"
    };
  }

  addDevice(): void {
    if (this.validateForm()) {
      const newDevice: ESP = {
        uuid: this.formData.uuid,
        gate: this.formData.gate,
        checkpoint: this.formData.checkpoint,
        calibrated: false,
        battery: "100"
      };
      const apiData = {...this.formData};

      this.devices = [...this.devices, newDevice];
      this.closeForm();
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);

      this.espService.addDevice(apiData).subscribe({
        error: (error) => {
          console.error('Failed to add device:', error)
        }
      });
    }
  }

  updateDevice(oldCheckpoint: string, oldGate: number): void {
    if (this.editingDevice && this.validateForm()) {
      const updatedDevice: ESP = {
        uuid: this.formData.uuid,
        gate: this.formData.gate,
        checkpoint: this.formData.checkpoint,
        calibrated: this.formData.calibrated,
        battery: this.formData.battery
      };
      const apiData = {...this.formData};

      // Use editingDevice reference directly — guaranteed to be the right one
      const idx = this.devices.indexOf(this.editingDevice);
      if (idx !== -1) {
        this.devices[idx] = updatedDevice;
      }
      this.devices = [...this.devices];
      const savedOldCheck = oldCheckpoint;
      const savedOldGate = oldGate;
      this.oldGate = 0;
      this.oldCheck = '';
      this.closeForm();
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);

      this.espService.editDevice(savedOldCheck, savedOldGate, apiData).subscribe({
        error: (error) => {
          console.error('Failed to update device:', error)
        }
      });
    }
  }

  deleteDevice(device: ESP): void {
    if (confirm(`Are you sure you want to delete "${device.checkpoint}"?`)) {
      this.devices = this.devices.filter(d => d !== device);
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);

      this.espService.deleteDevice(device.checkpoint, parseInt(device.gate)).subscribe({
        error: (error) => {
          console.error('Failed to delete device:', error)
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
    this.formData.uuid = "8062197a-4f7d-4bec-a412-4580db0ad19a";
  }

  getStatusColor(calibrated: boolean): string {
    if (calibrated) {
      return '#4CAF50';
    }
    return '#F44336';
  }

  getStatusText(calibrated: boolean): string {
    if (calibrated) {
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
  calibrateDevice(device: ESP): void {
    this.devices = this.devices.map (d => {
      if (d === device) {
        return {...d, calibrated: true};
      }
      return d;
    });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

}
