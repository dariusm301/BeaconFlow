import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';

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
  selector: 'app-baggage',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.scss']
})
export class BaggageComponent {
  selectedNeed: string = 'all';

  locations: Location[] = [
    {
      id: 1,
      name: 'Starbucks Terminal 1',
      type: 'Cafenea',
      category: 'coffee',
      icon: 'cafe',
      color: '#00704A',
      walkTime: '2 min',
      queueTime: '~5 min',
      position: 'Lângă Poarta A8',
      crowdLevel: 'low',
      crowdText: 'Liber',
      amenities: ['WiFi', 'Prize', 'To-Go']
    },
    {
      id: 2,
      name: 'Sky Lounge Premium',
      type: 'Lounge VIP',
      category: 'relax',
      icon: 'leaf',
      color: '#6B5B95',
      walkTime: '3 min',
      queueTime: '~2 min',
      position: 'Etaj 2, Zona A',
      crowdLevel: 'low',
      crowdText: 'Liber',
      amenities: ['WiFi', 'Băuturi', 'Snacks', 'Dușuri']
    },
    {
      id: 3,
      name: 'La Piazza Restaurant',
      type: 'Restaurant Italian',
      category: 'food',
      icon: 'restaurant',
      color: '#E74C3C',
      walkTime: '4 min',
      queueTime: '~12 min',
      position: 'Food Court Central',
      crowdLevel: 'medium',
      crowdText: 'Moderat',
      amenities: ['Meniu Complet', 'Vegetarian', 'WiFi']
    },
    {
      id: 4,
      name: 'Duty Free Shop',
      type: 'Magazine',
      category: 'shop',
      icon: 'bag',
      color: '#3498DB',
      walkTime: '1 min',
      queueTime: '~8 min',
      position: 'Zona Centrală',
      crowdLevel: 'medium',
      crowdText: 'Moderat',
      amenities: ['Parfumuri', 'Alcool', 'Ciocolată']
    },
    {
      id: 5,
      name: 'Business Center',
      type: 'Zonă de lucru',
      category: 'work',
      icon: 'laptop',
      color: '#2C3E50',
      walkTime: '5 min',
      queueTime: 'Fără coadă',
      position: 'Etaj 2, Zona B',
      crowdLevel: 'low',
      crowdText: 'Liber',
      amenities: ['WiFi Rapid', 'Imprimantă', 'Prize', 'Scaune Ergonomice']
    },
    {
      id: 6,
      name: 'Quick Bites',
      type: 'Fast Food',
      category: 'food',
      icon: 'fast-food',
      color: '#F39C12',
      walkTime: '2 min',
      queueTime: '~6 min',
      position: 'Lângă Poarta A10',
      crowdLevel: 'low',
      crowdText: 'Liber',
      amenities: ['Sandvișuri', 'Salate', 'To-Go']
    }
  ];

  get filteredLocations(): Location[] {
    if (this.selectedNeed === 'all') {
      return this.locations;
    }
    return this.locations.filter(loc => loc.category === this.selectedNeed);
  }

  selectNeed(need: string) {
    this.selectedNeed = need;
  }
}
