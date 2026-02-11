import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { registerPlugin } from '@capacitor/core';

interface BluetoothPlugin {
  startAdvertise(options: {uuid: string, manufacturerId: string, manufacturerData: string}): Promise<{ status: string }>;
  stopAdvertise(): Promise<{ status: string }>;
}

const BluetoothManager = registerPlugin<BluetoothPlugin>('BluetoothManager');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  uuid: string = '736bc65c-ac3e-4de8-8f41-a713a9a80ad6';
  manufacturerId: string = 'FFFF';
  statusMessage: string = 'Status: Ready';
  manufacturerData: string = 'FFFF';

  async startBle() {
    try {
      this.statusMessage = 'Status: Advertising';
      const result = await BluetoothManager.startAdvertise({
        uuid: this.uuid,
        manufacturerId: this.manufacturerId,
        manufacturerData: this.manufacturerData
      });
    } catch (e: any) {
      this.statusMessage = 'Error: ' + e.message;
    }
  }

  async stopBle() {
    try {
      this.statusMessage = 'Status: Stopped';
      const result = await BluetoothManager.stopAdvertise();
    } catch (e: any) {
      this.statusMessage = 'Stop Error: ' + e.message;
    }
  }
}