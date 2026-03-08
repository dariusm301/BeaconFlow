import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { HeadboardComponent } from "../headbar/headboard.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GoogleMap } from "@capacitor/google-maps";
import { Geolocation as CapGeolocation } from '@capacitor/geolocation';
import { Places } from "../services/places";
import { AirportFacility } from "../models/places";

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
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, HeadboardComponent],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BaggageComponent implements OnInit, OnDestroy {
  @ViewChild('mapCanvas') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  mapOpen = false;

  locations: Location[] = [];
  selectedNeed: string = 'all';
  isLoading: boolean = true;

  constructor(private cdr: ChangeDetectorRef, private service: Places) {}

  ngOnInit() {
    this.loadFacilities();
  }

  loadFacilities() {
    this.isLoading = true;
    this.service.getFacilities().subscribe({
      next: (apiData: AirportFacility[]) => {
        this.locations = apiData.map((item, index) => this.mapApiToLocation(item, index));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading facilities:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapApiToLocation(apiItem: AirportFacility, index: number): Location {
    let category = 'food';
    let icon = 'restaurant';
    let color = '#95a5a6';

    switch(apiItem.type?.toLowerCase()) {
      case 'food':
      case 'restaurant':
      case 'fast_food':
      case 'fast food':
      case 'fastfood':
        category = 'food'; icon = 'restaurant'; color = '#E74C3C'; break;
      case 'coffee':
      case 'cafe':
      case 'cafeteria':
        category = 'coffee'; icon = 'cafe'; color = '#00704A'; break;
      case 'shop':
      case 'shopping':
      case 'duty_free':
      case 'duty free':
      case 'store':
        category = 'shop'; icon = 'bag'; color = '#3498DB'; break;
      case 'lounge':
      case 'relax':
      case 'spa':
        category = 'relax'; icon = 'leaf'; color = '#6B5B95'; break;
      case 'service':
      case 'services':
      case 'info':
      case 'information':
      case 'help':
        category = 'service'; icon = 'information-circle'; color = '#FF9500'; break;
      case 'bar':
      case 'pub':
        category = 'food'; icon = 'wine'; color = '#8E44AD'; break;
      case 'pharmacy':
      case 'health':
        category = 'service'; icon = 'medkit'; color = '#27AE60'; break;
      case 'exchange':
      case 'atm':
      case 'bank':
        category = 'service'; icon = 'card'; color = '#2C3E50'; break;
      case 'work':
      case 'business':
      case 'business_center':
        category = 'work'; icon = 'laptop'; color = '#2C3E50'; break;
      default:
        category = 'food'; icon = 'restaurant'; color = '#E74C3C'; break;
    }

    return {
      id: index,
      name: apiItem.name,
      type: apiItem.type ? apiItem.type.charAt(0).toUpperCase() + apiItem.type.slice(1) : 'Facility',
      category: category,
      icon: icon,
      color: color,
      position: apiItem.location,
      amenities: apiItem.facilities || [],
      walkTime: Math.floor(Math.random() * 8 + 1) + ' min',
      queueTime: '~' + Math.floor(Math.random() * 15) + ' min',
      crowdLevel: apiItem.stars >= 4 ? 'medium' : 'low',
      crowdText: apiItem.stars >= 4 ? 'Moderate' : 'Clear',
      latitude: apiItem.latitude || 0,
      longitude: apiItem.longitude || 0
    };
  }

  async openMap() {
    // 1. Show the map container (gives it real dimensions)
    this.mapOpen = true;
    this.cdr.detectChanges();

    // 2. Make everything transparent so native map shows through
    document.body.classList.add('map-opened');

    // 3. Wait for DOM to fully render with real dimensions
    await new Promise(resolve => setTimeout(resolve, 300));


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

    // Use first facility with valid coords as center, fallback to
    const validLocations = this.locations.filter(l => l.latitude !== 0 && l.longitude !== 0);
    let centerLat = 47.0253; // Latitudine Oradea Airport
    let centerLng = 21.9025; // Longitudine Oradea Airport
    if (validLocations.length > 0) {
      centerLat = validLocations[0].latitude;
      centerLng = validLocations[0].longitude;
    }

    let hasLocationPermission = false;
    try {
      const permissions = await CapGeolocation.requestPermissions();
      if (permissions.location === 'granted' || permissions.coarseLocation === 'granted') {
        hasLocationPermission = true;
      }
    } catch (e) {
      console.warn('Geolocation error:', e);
    }

    this.newMap = await GoogleMap.create({
      id: 'airport-map',
      element: el,
      apiKey: 'API_HERE',
      config: {
        center: { lat: centerLat, lng: centerLng },
        zoom: 16,
      },
      forceCreate: true,
    });

    if (hasLocationPermission) {
      await this.newMap.enableCurrentLocation(true);
    }

    // --- COD NOU: Jittering + Optimizare cu addMarkers ---

    // 1. Pregătim un array cu toate markerele și le aplicăm o mică dispersie
    const markers = validLocations.map(loc => {
      // Generăm o mică diferență (offset) de aprox. 10-15 metri
      const offsetLat = (Math.random() - 0.5) * 0.00025;
      const offsetLng = (Math.random() - 0.5) * 0.00025;

      return {
        coordinate: {
          lat: loc.latitude + offsetLat,
          lng: loc.longitude + offsetLng
        },
        title: loc.name,
        snippet: loc.type + ' • ' + loc.position
      };
    });

    try {
      if (markers.length > 0) {
        await this.newMap.addMarkers(markers);
      }
    } catch (e) {
      console.warn('Eroare la adăugarea markerelor:', e);
    }

    console.log('Harta creată cu', markers.length, 'markere dispersate');
  }

  get filteredLocations(): Location[] {
    if (this.selectedNeed === 'all') return this.locations;
    return this.locations.filter(loc => loc.category === this.selectedNeed);
  }

  selectNeed(need: string) {
    this.selectedNeed = need;
  }
}
