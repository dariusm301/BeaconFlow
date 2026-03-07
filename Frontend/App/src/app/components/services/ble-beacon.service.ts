import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { BluetoothLowEnergy } from '@capgo/capacitor-bluetooth-low-energy';

/**
 * Service UUID matching the TARGET_SERVICE_UUID in the ESP32 BLE scanner firmware.
 * The firmware scans for BLE peripherals advertising this UUID, then sends an
 * ESP-NOW message to the gateway when a device is detected within range.
 *
 * C firmware array (little-endian bytes in packet):
 *   {0x9a, 0xd1, 0x0a, 0xdb, 0x80, 0x45, 0x12, 0xa4,
 *    0xec, 0x4b, 0x7d, 0x4f, 0x7a, 0x19, 0x62, 0x80}
 */
const BEACONFLOW_SERVICE_UUID = '9ad10adb-8045-12a4-ec4b-7d4f7a196280';

@Injectable({
  providedIn: 'root'
})
export class BleBeaconService {
  private isAdvertising = false;
  private currentTicketId: string | null = null;

  /**
   * Start BLE advertising so that ESP32 scanner devices can detect this phone.
   * Must be called after a boarding pass is uploaded and the ticket ID is known.
   *
   * @param ticketId - Passenger ticket identifier from the backend
   */
  async startBeacon(ticketId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('BLE advertising skipped (not a native platform)');
      return;
    }

    if (this.isAdvertising) {
      await this.stopBeacon();
    }

    try {
      this.currentTicketId = ticketId;

      await BluetoothLowEnergy.initialize({ mode: 'peripheral' });

      const permissions = await BluetoothLowEnergy.requestPermissions();
      if (permissions.bluetooth !== 'granted') {
        console.warn('Bluetooth permission not granted - BLE advertising unavailable');
        return;
      }

      await BluetoothLowEnergy.startAdvertising({
        name: 'BeaconFlow',
        services: [BEACONFLOW_SERVICE_UUID],
        includeName: true,
        includeTxPowerLevel: false
      });

      this.isAdvertising = true;
      console.log('BLE beacon started for ticket:', ticketId);
    } catch (error) {
      console.error('BLE advertising failed to start:', error);
      this.isAdvertising = false;
    }
  }

  /**
   * Stop BLE advertising. Call when the user leaves the airport or the app is closed.
   */
  async stopBeacon(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.isAdvertising) {
      return;
    }

    try {
      await BluetoothLowEnergy.stopAdvertising();
      this.isAdvertising = false;
      this.currentTicketId = null;
      console.log('BLE beacon stopped');
    } catch (error) {
      console.error('BLE advertising failed to stop:', error);
    }
  }

  get advertising(): boolean {
    return this.isAdvertising;
  }

  get ticketId(): string | null {
    return this.currentTicketId;
  }
}
