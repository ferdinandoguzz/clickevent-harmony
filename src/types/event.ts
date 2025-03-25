
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
}

export interface Club {
  id: string;
  name: string;
}
