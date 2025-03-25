
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

export interface EventVoucher {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  remaining: number;
  isActive: boolean;
}

// Interface for purchased vouchers
export interface PurchasedVoucher {
  id: string;
  eventId: string;
  attendeeId: string;
  packageId: string;
  packageName: string;
  purchaseDate: string;
  price: number;
  isRedeemed: boolean;
  redemptionTime: string | null;
  qrCode: string;
}
