import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  airplane,
  qrCode,
  scan,
  time,
  shieldCheckmark,
  notifications,
  notificationsOutline,
  calendarOutline,
  timeOutline,
  pricetagOutline,
  locationOutline,
  checkmarkCircle,
  alertCircle,
  informationCircle,
  cafe,
  home,
  homeOutline,
  people,
  peopleOutline,
  briefcase,
  briefcaseOutline,
  newspaper,
  location,
  bulb,
  flash,
  arrowForward,
  grid,
  restaurant,
  leaf,
  bag,
  laptop,
  star,
  walk,
  chevronForward,
  fastFood,
  compass,
  compassOutline,
  exit
} from 'ionicons/icons';

// Register icons
addIcons({
  'airplane': airplane,
  'qr-code': qrCode,
  'scan': scan,
  'time': time,
  'shield-checkmark': shieldCheckmark,
  'notifications': notifications,
  'notifications-outline': notificationsOutline,
  'calendar-outline': calendarOutline,
  'time-outline': timeOutline,
  'pricetag-outline': pricetagOutline,
  'location-outline': locationOutline,
  'checkmark-circle': checkmarkCircle,
  'alert-circle': alertCircle,
  'information-circle': informationCircle,
  'cafe': cafe,
  'home': home,
  'home-outline': homeOutline,
  'people': people,
  'people-outline': peopleOutline,
  'briefcase': briefcase,
  'briefcase-outline': briefcaseOutline,
  'newspaper': newspaper,
  'location': location,
  'bulb': bulb,
  'flash': flash,
  'arrow-forward': arrowForward,
  'grid': grid,
  'restaurant': restaurant,
  'leaf': leaf,
  'bag': bag,
  'laptop': laptop,
  'star': star,
  'walk': walk,
  'chevron-forward': chevronForward,
  'fast-food': fastFood,
  'compass': compass,
  'compass-outline': compassOutline,
  'exit-outline': exit
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular({})
  ]
});
