import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Mail, User, Phone, MapPin, Calendar, Clock, DollarSign, Search, Check, X, Plus, UserCheck, Info, DownloadCloud, Printer, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data
const mockEvents = [
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
    ]
  }
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
    eventId: '1',
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
    eventId: '1',
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

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface Event {
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

const QRCodeDisplay: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-muted p-4">
          <QrCode className="w-full h-full text-primary" />
          <span className="sr-only">QR Code: {value}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Scan with QR code reader</p>
    </div>
  );
};

const RegistrationForm: React.FC<{ event: Event; onAddAttendee: (attendee: Partial<Attendee>) => void }> = ({ 
  event, 
  onAddAttendee 
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = event.formFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    const newAttendee: Partial<Attendee> = {
      eventId: event.id,
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      company: formData.company,
      jobTitle: formData.jobTitle,
      dietaryRestrictions: formData.dietaryRestrictions,
      registrationDate: new Date().toISOString(),
      checkedIn: false,
      checkinTime: null,
      qrCode: `QR-CODE-UNIQUE-${Date.now()}`
    };
    
    onAddAttendee(newAttendee);
    setFormData({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {event.formFields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
            />
          ) : (
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              required={field.required}
            />
          )}
        </div>
      ))}
      <Button type="submit" className="mt-6">Register Attendee</Button>
    </form>
  );
};

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch event data
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent as Event);
    }

    // Fetch attendees
    const eventAttendees = mockAttendees.filter(a => a.eventId === eventId);
    setAttendees(eventAttendees);
  }, [eventId]);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.phone.includes(searchQuery)
  );

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const checkedInPercentage = attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0;

  const handleToggleCheckin = (attendeeId: string) => {
    setAttendees(
      attendees.map(attendee => {
        if (attendee.id === attendeeId) {
          const updatedAttendee = {
            ...attendee,
            checkedIn: !attendee.checkedIn,
            checkinTime: !attendee.checkedIn ? new Date().toISOString() : null
          };
          toast({
            title: updatedAttendee.checkedIn ? "Attendee checked in" : "Attendee checked out",
            description: `${attendee.name} has been ${updatedAttendee.checkedIn ? 'checked in' : 'checked out'} successfully.`
          });
          return updatedAttendee;
        }
        return attendee;
      })
    );
  };

  const handleViewQR = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setQrDialogOpen(true);
  };

  const handleDownloadQR = (attendee: Attendee) => {
    toast({
      title: "QR Code downloaded",
      description: `QR Code for ${attendee.name} has been downloaded successfully.`
    });
  };

  const handleSendInvitation = (attendee: Attendee) => {
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${attendee.email}.`
    });
  };

  const handleAddAttendee = (newAttendee: Partial<Attendee>) => {
    const attendee: Attendee = {
      id: `attendee-${Date.now()}`,
      ...newAttendee,
      eventId: event.id,
      registrationDate: new Date().toISOString(),
      checkedIn: false,
      checkinTime: null,
      qrCode: `QR-CODE-UNIQUE-${Date.now()}`
    } as Attendee;

    setAttendees([...attendees, attendee]);
    
    // Update event registration count
    setEvent({
      ...event,
      registrationCount: event.registrationCount + 1
    });

    toast({
      title: "Attendee registered",
      description: `${attendee.name} has been registered successfully.`
    });
  };

  const handleExportAttendees = () => {
    toast({
      title: "Attendee list exported",
      description: "The attendee list has been exported as an Excel file."
    });
  };

  return (
    <div className="animate-in">
      <header className="mb-8">
        <Link 
          to="/events" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Link>
        
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={event.isPaid ? "default" : "outline"}>
                {event.isPaid ? `$${event.price}` : 'Free'}
              </Badge>
              <Badge variant="secondary">
                {event.status === 'upcoming' ? 'Upcoming' : event.status === 'past' ? 'Past' : 'Draft'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{event.name}</h1>
            <p className="text-muted-foreground">
              Organized by {event.clubName}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportAttendees}>
              <Download className="mr-2 h-4 w-4" />
              Export Attendees
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{event.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-muted-foreground">
                        {formatDate(startDate)}
                        {startDate.toDateString() !== endDate.toDateString() && (
                          <> - {formatDate(endDate)}</>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-muted-foreground">
                        {formatTime(startDate)} - {formatTime(endDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-muted-foreground">{event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Price</div>
                      <div className="text-muted-foreground">
                        {event.isPaid ? `$${event.price.toFixed(2)}` : 'Free'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Maximum Attendees</div>
                      <div className="text-muted-foreground">{event.maxAttendees}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Registrations</div>
                    <div className="text-sm text-muted-foreground">
                      {event.registrationCount}/{event.maxAttendees}
                    </div>
                  </div>
                  <Progress
                    value={(event.registrationCount / event.maxAttendees) * 100}
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Check-ins</div>
                    <div className="text-sm text-muted-foreground">
                      {checkedInCount}/{attendees.length}
                    </div>
                  </div>
                  <Progress
                    value={checkedInPercentage}
                    className="h-2"
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-md bg-secondary/50">
                    <div className="text-3xl font-bold">{event.registrationCount}</div>
                    <div className="text-sm text-muted-foreground">Registrations</div>
                  </div>
                  <div className="text-center p-4 rounded-md bg-secondary/50">
                    <div className="text-3xl font-bold">{checkedInCount}</div>
                    <div className="text-sm text-muted-foreground">Check-ins</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendees" className="pt-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportAttendees} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print List
              </Button>
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
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee) => {
                    const registrationDate = new Date(attendee.registrationDate);
                    return (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{attendee.phone}</TableCell>
                        <TableCell>
                          {registrationDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={attendee.checkedIn ? "default" : "outline"}>
                            {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewQR(attendee)}
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="sr-only">View QR Code</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleSendInvitation(attendee)}
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Send Invitation</span>
                            </Button>
                            <Button
                              variant={attendee.checkedIn ? "destructive" : "default"}
                              size="icon"
                              onClick={() => handleToggleCheckin(attendee.id)}
                            >
                              {attendee.checkedIn ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {attendee.checkedIn ? 'Check Out' : 'Check In'}
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        
        <TabsContent value="registration" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Registration Form</h2>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Registration Form Preview</AlertTitle>
                <AlertDescription>
                  Use this form to add new attendees manually. In a live environment, this form would be public-facing for event registration.
                </AlertDescription>
              </Alert>
              <Card>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>Register a new attendee</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationForm event={event} onAddAttendee={handleAddAttendee} />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Form Fields</h2>
              <p className="text-muted-foreground mb-6">
                These are the fields that attendees will fill out when registering for this event.
              </p>
              <Card>
                <CardHeader>
                  <CardTitle>Form Configuration</CardTitle>
                  <CardDescription>
                    Customize the registration form fields for this event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.formFields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {field.type} • {field.required ? 'Required' : 'Optional'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" disabled>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Form builder functionality will be enabled in a future update.
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attendee QR Code</DialogTitle>
            <DialogDescription>
              {selectedAttendee?.name} - {selectedAttendee?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4">
            {selectedAttendee && (
              <QRCodeDisplay value={selectedAttendee.qrCode} />
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={() => selectedAttendee && handleSendInvitation(selectedAttendee)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email to Attendee
            </Button>
            <Button
              className="sm:flex-1"
              onClick={() => selectedAttendee && handleDownloadQR(selectedAttendee)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
