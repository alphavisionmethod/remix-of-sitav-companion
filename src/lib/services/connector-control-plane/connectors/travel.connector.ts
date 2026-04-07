// SITA OS — Travel Connector
export interface TravelCapabilities {
  searchFlights: (params: { origin: string; destination: string; date: string }) => ConnectorResult;
  searchHotels: (params: { location: string; checkIn: string; checkOut: string }) => ConnectorResult;
  getBooking: (bookingId: string) => ConnectorResult;
  cancelBooking: (bookingId: string) => ConnectorResult;
}
interface ConnectorResult { success: boolean; data?: Record<string, unknown>; error?: string }

export function createTravelConnector(): TravelCapabilities {
  return {
    searchFlights: (p) => ({ success: true, data: { flights: [{ id: "fl-1", airline: "United", departure: p.date, origin: p.origin, destination: p.destination, priceCents: 45000 }], count: 1 } }),
    searchHotels: (p) => ({ success: true, data: { hotels: [{ id: "ht-1", name: "Grand Hotel", location: p.location, pricePerNightCents: 22000, rating: 4.5 }], count: 1 } }),
    getBooking: (id) => ({ success: true, data: { bookingId: id, status: "confirmed", confirmationNumber: "ABC123" } }),
    cancelBooking: (id) => ({ success: true, data: { bookingId: id, cancelled: true, refundCents: 45000 } }),
  };
}

