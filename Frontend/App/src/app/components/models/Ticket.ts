export interface Ticket {
  arrival_airport: string
  departure_airport: string;
  flight_number: string;
  departure_time: string;
  gate: string;
  uuid: string;
  ticket_id: string;

}
export interface WaitingTimeResponse {
  queue_length: string;
  waiting_time: {
    estimated_wait_minutes: number;
    status: string;
  };
}
