// SITA OS — Website: Booking Request Submission
export interface BookingRequestSubmission {
  id: string;
  formId: string;
  siteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceRequested: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  convertedToBookingId?: string;
  status: "new" | "confirmed" | "waitlisted" | "cancelled";
  createdAt: string;
}
