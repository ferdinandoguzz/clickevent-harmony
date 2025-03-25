// Club data
export const mockClubs = [
  {
    id: '1',
    name: 'Tech Enthusiasts',
    description: 'A club for technology enthusiasts and professionals.',
    memberCount: 125,
    eventCount: 8,
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    name: 'Business Network',
    description: 'Professional networking for business leaders.',
    memberCount: 89,
    eventCount: 5,
    createdAt: '2023-02-15',
  },
  {
    id: '3',
    name: 'Creative Arts',
    description: 'A community for artists and creative professionals.',
    memberCount: 67,
    eventCount: 3,
    createdAt: '2023-03-22',
  },
  {
    id: '4',
    name: 'Health & Wellness',
    description: 'Focus on healthy living and wellness practices.',
    memberCount: 42,
    eventCount: 2,
    createdAt: '2023-04-05',
  },
];

// Event data
export const mockEvents = [
  {
    id: '1',
    name: 'Tech Conference 2023',
    description: 'Annual tech conference featuring the latest in technology trends.',
    clubId: '1',
    clubName: 'Tech Enthusiasts',
    location: 'Convention Center, New York',
    startDate: '2023-06-15T09:00:00',
    endDate: '2023-06-15T17:00:00',
    registrationCount: 45,
    maxAttendees: 100,
    isPaid: true,
    price: 49.99,
    status: 'upcoming' as const,
    formFields: [
      { id: 'name', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true },
      { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { id: 'company', label: 'Company', type: 'text', required: false },
      { id: 'jobTitle', label: 'Job Title', type: 'text', required: false },
      { id: 'dietaryRestrictions', label: 'Dietary Restrictions', type: 'textarea', required: false },
    ],
    voucherPackages: [
      {
        id: 'vp1',
        name: '1x Drink Voucher',
        description: 'Single drink voucher valid for any beverage at the event.',
        price: 10.00,
        contents: [
          { type: 'drink', quantity: 1 }
        ]
      },
      {
        id: 'vp2',
        name: '2x Drink Vouchers',
        description: 'Package of two drink vouchers at a discounted price.',
        price: 18.00,
        contents: [
          { type: 'drink', quantity: 2 }
        ]
      },
      {
        id: 'vp3',
        name: '1x Drink + 1x Food Voucher',
        description: 'Combo package with one drink and one food voucher.',
        price: 25.00,
        contents: [
          { type: 'drink', quantity: 1 },
          { type: 'food', quantity: 1 }
        ]
      }
    ]
  }
];

// Attendee data
export const mockAttendees = [
  {
    id: '1',
    eventId: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    jobTitle: 'Software Engineer',
    dietaryRestrictions: 'Vegetarian',
    registrationDate: '2023-05-10T14:23:00',
    checkedIn: true,
    checkinTime: '2023-06-15T09:15:00',
    qrCode: 'QR-CODE-UNIQUE-1'
  },
  {
    id: '2',
    eventId: '1',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: '+1 (555) 234-5678',
    company: 'Data Insights',
    jobTitle: 'Data Scientist',
    dietaryRestrictions: '',
    registrationDate: '2023-05-12T09:45:00',
    checkedIn: true,
    checkinTime: '2023-06-15T09:30:00',
    qrCode: 'QR-CODE-UNIQUE-2'
  }
];

// Purchased vouchers data (renamed from mockVouchers to reflect they are purchased vouchers)
export const mockPurchasedVouchers = [
  {
    id: 'v1',
    eventId: '1',
    attendeeId: '1',
    packageId: 'vp1',
    packageName: '1x Drink Voucher',
    purchaseDate: '2023-06-01T10:15:00',
    price: 10.00,
    isRedeemed: false,
    redemptionTime: null,
    qrCode: 'VOUCHER-QR-1'
  },
  {
    id: 'v2',
    eventId: '1',
    attendeeId: '2',
    packageId: 'vp3',
    packageName: '1x Drink + 1x Food Voucher',
    purchaseDate: '2023-06-02T14:30:00',
    price: 25.00,
    isRedeemed: true,
    redemptionTime: '2023-06-15T12:45:00',
    qrCode: 'VOUCHER-QR-2'
  }
];

// For backward compatibility
export const mockVouchers = mockPurchasedVouchers;
