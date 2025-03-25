
import React, { useState, useRef, useEffect } from 'react';
import { QrCodeIcon, UserCheck, Check, Search, Camera, RefreshCcw, User, Mail, Phone, CalendarCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock events and attendees (same as in EventDetail)
const mockEvents = [
  {
    id: '1',
    name: 'Tech Conference 2023',
  },
  {
    id: '2',
    name: 'Networking Mixer',
  },
  {
    id: '3',
    name: 'Art Exhibition',
  },
];

const mockAttendees = [
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
  },
  {
    id: '3',
    eventId: '1',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1 (555) 345-6789',
    company: 'Innovate LLC',
    jobTitle: 'Product Manager',
    dietaryRestrictions: 'Gluten-free',
    registrationDate: '2023-05-15T16:10:00',
    checkedIn: false,
    checkinTime: null,
    qrCode: 'QR-CODE-UNIQUE-3'
  },
  {
    id: '4',
    eventId: '2',
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    phone: '+1 (555) 456-7890',
    company: 'TechStart',
    jobTitle: 'UX Designer',
    dietaryRestrictions: '',
    registrationDate: '2023-05-18T11:30:00',
    checkedIn: false,
    checkinTime: null,
    qrCode: 'QR-CODE-UNIQUE-4'
  },
  {
    id: '5',
    eventId: '2',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '+1 (555) 567-8901',
    company: 'Cloud Systems',
    jobTitle: 'DevOps Engineer',
    dietaryRestrictions: 'No dairy',
    registrationDate: '2023-05-20T14:00:00',
    checkedIn: false,
    checkinTime: null,
    qrCode: 'QR-CODE-UNIQUE-5'
  },
];

interface Event {
  id: string;
  name: string;
}

interface Attendee {
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

const QRScanner: React.FC<{ onScan: (qrCode: string) => void }> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const startScanner = () => {
    setIsScanning(true);
    // In a real implementation, we would use a QR code scanning library
    // For the prototype, we'll simulate scanning after a delay
    setTimeout(() => {
      const mockQRCode = `QR-CODE-UNIQUE-${Math.floor(Math.random() * 5) + 1}`;
      onScan(mockQRCode);
      setIsScanning(false);
    }, 2000);
  };
  
  const stopScanner = () => {
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted mb-4">
        {isScanning ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-1 translate-y-1"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
            <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              {isScanning ? 'Scanning QR code...' : 'QR code scanner will appear here'}
            </p>
          </div>
        )}
      </div>
      
      <Button 
        onClick={isScanning ? stopScanner : startScanner} 
        className="w-full max-w-md"
      >
        {isScanning ? (
          <>
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            Cancel Scanning
          </>
        ) : (
          <>
            <QrCodeIcon className="mr-2 h-4 w-4" />
            Start Scanning
          </>
        )}
      </Button>
    </div>
  );
};

const AttendeeInfo: React.FC<{ attendee: Attendee; onCheckIn: () => void }> = ({ attendee, onCheckIn }) => {
  const registrationDate = new Date(attendee.registrationDate);
  const checkinTime = attendee.checkinTime ? new Date(attendee.checkinTime) : null;
  
  return (
    <Card className="animate-in w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendee Information</CardTitle>
          <Badge variant={attendee.checkedIn ? "default" : "outline"}>
            {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
          </Badge>
        </div>
        <CardDescription>QR Code: {attendee.qrCode}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">{attendee.name}</div>
            {attendee.jobTitle && (
              <div className="text-sm text-muted-foreground">
                {attendee.jobTitle} at {attendee.company}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Registered</div>
              <div>{registrationDate.toLocaleDateString()}</div>
            </div>
          </div>
          {checkinTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Checked In</div>
                <div>{checkinTime.toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>
        
        {attendee.dietaryRestrictions && (
          <div className="pt-2">
            <div className="text-sm font-medium">Dietary Restrictions</div>
            <div className="text-sm text-muted-foreground">{attendee.dietaryRestrictions}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onCheckIn} 
          className="w-full" 
          variant={attendee.checkedIn ? "secondary" : "default"}
          disabled={attendee.checkedIn}
        >
          {attendee.checkedIn ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Already Checked In
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Check In Attendee
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckIn: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('1'); // Default to first event
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedAttendee, setScannedAttendee] = useState<Attendee | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const filteredAttendees = attendees.filter(attendee => 
    attendee.eventId === selectedEvent &&
    (attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.phone.includes(searchQuery))
  );

  const handleScan = (qrCode: string) => {
    // Find attendee by QR code
    const attendee = attendees.find(a => a.qrCode === qrCode);
    if (attendee) {
      setScannedAttendee(attendee);
      setSelectedEvent(attendee.eventId);
      
      // If attendee is from a different event, switch to that event's tab
      if (activeTab !== 'scan') {
        setActiveTab('scan');
      }
    } else {
      toast({
        title: "Invalid QR Code",
        description: "No attendee found with this QR code.",
        variant: "destructive"
      });
    }
  };

  const handleCheckIn = (attendeeId: string) => {
    setIsCheckingIn(true);
    
    // Simulate checking in process
    setTimeout(() => {
      setAttendees(
        attendees.map(attendee => {
          if (attendee.id === attendeeId && !attendee.checkedIn) {
            toast({
              title: "Check-in successful",
              description: `${attendee.name} has been checked in.`
            });
            return {
              ...attendee,
              checkedIn: true,
              checkinTime: new Date().toISOString()
            };
          }
          return attendee;
        })
      );
      
      // Update scanned attendee if it's the same one
      if (scannedAttendee && scannedAttendee.id === attendeeId) {
        setScannedAttendee({
          ...scannedAttendee,
          checkedIn: true,
          checkinTime: new Date().toISOString()
        });
      }
      
      setIsCheckingIn(false);
    }, 1000);
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    setScannedAttendee(null);
  };

  const clearScannedAttendee = () => {
    setScannedAttendee(null);
  };

  return (
    <div className="animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Check-in</h1>
        <p className="text-muted-foreground">Scan QR codes and manage event attendees.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockEvents.map(event => (
                <Button
                  key={event.id}
                  variant={selectedEvent === event.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleEventChange(event.id)}
                >
                  {event.name}
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Check-in Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Registered</div>
                  <div className="text-2xl font-bold">
                    {attendees.filter(a => a.eventId === selectedEvent).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Checked In</div>
                  <div className="text-2xl font-bold">
                    {attendees.filter(a => a.eventId === selectedEvent && a.checkedIn).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">QR Scanner</TabsTrigger>
              <TabsTrigger value="list">Attendee List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="pt-6">
              <div className="flex flex-col items-center md:flex-row gap-8">
                <div className="w-full md:w-auto">
                  <QRScanner onScan={handleScan} />
                </div>
                
                <div className="w-full md:flex-1 flex justify-center">
                  {scannedAttendee ? (
                    <AttendeeInfo 
                      attendee={scannedAttendee} 
                      onCheckIn={() => handleCheckIn(scannedAttendee.id)} 
                    />
                  ) : (
                    <div className="w-full max-w-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg">
                      <QrCodeIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No QR Code Scanned</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Scan a QR code to view attendee information and check them in.
                      </p>
                      <p className="text-xs text-muted-foreground text-center max-w-xs">
                        You can also search for attendees in the "Attendee List" tab if you need to check someone in manually.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="pt-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search attendees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {filteredAttendees.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendees.map((attendee) => (
                        <TableRow key={attendee.id}>
                          <TableCell className="font-medium">{attendee.name}</TableCell>
                          <TableCell>{attendee.email}</TableCell>
                          <TableCell>{attendee.phone}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={attendee.checkedIn ? "default" : "outline"}>
                              {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={attendee.checkedIn ? "secondary" : "default"}
                              size="sm"
                              onClick={() => handleCheckIn(attendee.id)}
                              disabled={attendee.checkedIn || isCheckingIn}
                            >
                              {attendee.checkedIn ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Checked In
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Check In
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <UserCheck className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No attendees found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'No attendees match your search criteria.' 
                      : 'There are no attendees registered for this event yet.'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
