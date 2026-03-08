export interface AirportFacility {
  name: string;
  average_price: string;
  stars: number;
  type: string;
  location: string;
  facilities: string[];
  latitude: number;
  longitude: number;
}


export interface AirportResponse {
  data: AirportFacility[];
}
