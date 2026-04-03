export interface SchoolActivityItem {
  id: string;
  childId: string;
  schoolName: string;
  activityType: "class" | "sport" | "club" | "event" | "field-trip" | "conference" | "exam";
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  requiresVolunteer: boolean;
  requiresPayment: boolean;
  paymentAmountCents?: number;
  paymentStatus?: "pending" | "paid";
  notes: string;
}

export interface SchoolFeeItem {
  id: string;
  childId: string;
  schoolName: string;
  feeType: "tuition" | "activity" | "supplies" | "lunch" | "transport" | "other";
  description: string;
  amountCents: number;
  dueDate: string;
  status: "upcoming" | "due" | "paid" | "overdue";
  paidAt?: string;
  receiptId?: string;
}
