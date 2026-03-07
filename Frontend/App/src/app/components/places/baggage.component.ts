import {Component, ElementRef, OnDestroy, ViewChild, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {HeadboardComponent} from "../headbar/headboard.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {GoogleMap} from "@capacitor/google-maps";
import { Geolocation as CapGeolocation } from '@capacitor/geolocation';

interface Location {
  id: number;
  name: string;
  type: string;
  category: string;
  icon: string;
  color: string;
  walkTime: string;
  queueTime: string;
  position: string;
  crowdLevel: string;
  crowdText: string;
  amenities: string[];
}

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeadboardComponent],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaggageComponent implements OnDestroy {
  @ViewChild('mapCanvas') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  mapOpen = false;

  constructor(private cdr: ChangeDetectorRef) {}

  async openMap() {
    // 1. Show the map container (gives it real dimensions)
    this.mapOpen = true;
    this.cdr.detectChanges();

    // 2. Make everything transparent so native map shows through
    document.body.classList.add('map-opened');

    // 3. Wait for DOM to fully render with real dimensions
    await new Promise(resolve => setTimeout(resolve, 300));

    // 4. NOW create the map - element has real dimensions, body is transparent
    await this.createMap();
  }

  async closeMap() {
    // 1. Destroy the native map first
    if (this.newMap) {
      try { await this.newMap.destroy(); } catch (e) {}
      this.newMap = null as any;
    }

    // 2. Remove transparency
    document.body.classList.remove('map-opened');
    document.documentElement.classList.remove('capacitor-google-map-transparent');

    // 3. Hide the map container
    this.mapOpen = false;
    this.cdr.detectChanges();
  }

  async ngOnDestroy() {
    if (this.newMap) {
      try { await this.newMap.destroy(); } catch (e) {}
      this.newMap = null as any;
    }
    document.body.classList.remove('map-opened');
    document.documentElement.classList.remove('capacitor-google-map-transparent');
  }

  async ionViewWillLeave() {
    if (this.newMap) {
      try { await this.newMap.destroy(); } catch (e) {}
      this.newMap = null as any;
    }
    this.mapOpen = false;
    document.body.classList.remove('map-opened');
    document.documentElement.classList.remove('capacitor-google-map-transparent');
  }

  private async createMap() {
    // Safety check - element must exist and have dimensions
    if (!this.mapRef?.nativeElement) {
      console.error('Map element not found!');
      return;
    }

    const el = this.mapRef.nativeElement;
    const rect = el.getBoundingClientRect();
    console.log('Map element rect:', rect.width, rect.height);

    if (rect.width === 0 || rect.height === 0) {
      console.error('Map element has zero dimensions!', rect);
      return;
    }

    let centerLat = 44.5032;
    let centerLng = 26.0751;
    let hasLocationPermission = false;

    try {
      const permissions = await CapGeolocation.requestPermissions();
      if (permissions.location === 'granted' || permissions.coarseLocation === 'granted') {
        hasLocationPermission = true;
        const position = await CapGeolocation.getCurrentPosition();
        centerLat = position.coords.latitude;
        centerLng = position.coords.longitude;
      }
    } catch (e) {
      console.warn('Geolocation error:', e);
    }

    this.newMap = await GoogleMap.create({
      id: 'airport-map',
      element: el,
      apiKey: 'AIzaSyAtFZ1DUKadzQDfLTkQDeY3fbqDDwK0lSI',
      config: {
        center: { lat: centerLat, lng: centerLng },
        zoom: 16,
      },
      forceCreate: true,
    });

    if (hasLocationPermission) {
      await this.newMap.enableCurrentLocation(true);
    }

    console.log('Map created successfully!');
  }

  selectedNeed: string = 'all';

  locations: Location[] = [
    {
      id: 1, name: 'Starbucks Terminal 1', type: 'Coffee Shop', category: 'coffee',
      icon: 'cafe', color: '#00704A', walkTime: '2 min', queueTime: '~5 min',
      position: 'Near Gate A8', crowdLevel: 'low', crowdText: 'Clear',
      amenities: ['WiFi', 'Outlets', 'To-Go']
    },
    {
      id: 2, name: 'Sky Lounge Premium', type: 'VIP Lounge', category: 'relax',
      icon: 'leaf', color: '#6B5B95', walkTime: '3 min', queueTime: '~2 min',
      position: 'Floor 2, Zone A', crowdLevel: 'low', crowdText: 'Clear',
      amenities: ['WiFi', 'Drinks', 'Snacks', 'Showers']
    },
    {
      id: 3, name: 'La Piazza Restaurant', type: 'Italian Restaurant', category: 'food',
      icon: 'restaurant', color: '#E74C3C', walkTime: '4 min', queueTime: '~12 min',
      position: 'Central Food Court', crowdLevel: 'medium', crowdText: 'Moderate',
      amenities: ['Full Menu', 'Vegetarian', 'WiFi']
    },
    {
      id: 4, name: 'Duty Free Shop', type: 'Shop', category: 'shop',
      icon: 'bag', color: '#3498DB', walkTime: '1 min', queueTime: '~8 min',
      position: 'Central Zone', crowdLevel: 'medium', crowdText: 'Moderate',
      amenities: ['Perfumes', 'Alcohol', 'Chocolate']
    },
    {
      id: 5, name: 'Business Center', type: 'Work Area', category: 'work',
      icon: 'laptop', color: '#2C3E50', walkTime: '5 min', queueTime: 'No queue',
      position: 'Floor 2, Zone B', crowdLevel: 'low', crowdText: 'Clear',
      amenities: ['Fast WiFi', 'Printer', 'Outlets', 'Ergonomic Chairs']
    },
    {
      id: 6, name: 'Quick Bites', type: 'Fast Food', category: 'food',
      icon: 'fast-food', color: '#F39C12', walkTime: '2 min', queueTime: '~6 min',
      position: 'Near Gate A10', crowdLevel: 'low', crowdText: 'Clear',
      amenities: ['Sandwiches', 'Salads', 'To-Go']
    }
  ];

  get filteredLocations(): Location[] {
    if (this.selectedNeed === 'all') return this.locations;
    return this.locations.filter(loc => loc.category === this.selectedNeed);
  }

  selectNeed(need: string) {
    this.selectedNeed = need;
  }
}
