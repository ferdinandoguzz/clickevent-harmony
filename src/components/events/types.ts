
export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  clubId: string;
  clubName: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationCount: number;
  maxAttendees: number;
  isPaid: boolean;
  price: number;
  status: 'upcoming' | 'past' | 'draft';
  formFields: FormField[];
}

export interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  dietaryRestrictions?: string;
  registrationDate: string;
  checkedIn: boolean;
  checkinTime: string | null;
  qrCode: string;
}
