import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Mail, User, Phone, MapPin, Calendar, Clock, DollarSign, Search, Check, X, Plus, UserCheck, Info, Printer, Edit, Ticket, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mockEvents, mockAttendees } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormFieldDialog } from '@/components/events/FormFieldDialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

interface ManualAttendeeFormProps {
  eventId: string;
  onAddAttendee: (attendee: Partial<Attendee>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManualAttendeeForm: React.FC<ManualAttendeeFormProps> = ({ 
  eventId, 
  onAddAttendee, 
  open, 
  onOpenChange 
}) => {
  const attendeeFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().optional(),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
  });

  type AttendeeFormValues = z.infer<typeof attendeeFormSchema>;

  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(attendeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      dietaryRestrictions: "",
    },
  });

  const handleSubmit = (values: AttendeeFormValues) => {
    const newAttendee: Partial<Attendee> = {
      eventId: eventId,
      name: values.name,
      email: values.email,
      phone: values.phone || '',
      company: values.company,
      jobTitle: values.jobTitle,
      dietaryRestrictions: values.dietaryRestrictions,
      registrationDate: new Date().toISOString(),
      checkedIn: false,
      checkinTime: null,
      qrCode: `QR-CODE-UNIQUE-${Date.now()}`
    };
    
    onAddAttendee(newAttendee);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Attendee Manually</DialogTitle>
          <DialogDescription>
            Enter the attendee details to add them to this event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 123-456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Job Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any dietary restrictions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Attendee</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
  const [formFieldDialogOpen, setFormFieldDialogOpen] = useState(false);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);
  const [manualAddDialogOpen, setManualAddDialogOpen] = useState(false);

  useEffect(() => {
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent as Event);
    }

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

  const handleEditFormField = (field: FormField) => {
    setSelectedFormField(field);
    setFormFieldDialogOpen(true);
  };

  const handleAddFormField = () => {
    setSelectedFormField(null);
    setFormFieldDialogOpen(true);
  };

  const handleSaveFormField = (field: FormField) => {
    if (event) {
      let updatedFormFields;
      
      if (selectedFormField) {
        updatedFormFields = event.formFields.map(f => 
          f.id === field.id ? field : f
        );
        toast({
          title: "Field updated",
          description: `The field "${field.label}" has been updated successfully.`
        });
      } else {
        const newField = {
          ...field,
          id: `field-${Date.now()}`
        };
        updatedFormFields = [...event.formFields, newField];
        toast({
          title: "Field added",
          description: `The field "${field.label}" has been added successfully.`
        });
      }
      
      setEvent({
        ...event,
        formFields: updatedFormFields
      });
    }
    
    setFormFieldDialogOpen(false);
    setSelectedFormField(null);
  };

  const handleDeleteFormField = (fieldId: string) => {
    if (event) {
      const updatedFormFields = event.formFields.filter(f => f.id !== fieldId);
      
      setEvent({
        ...event,
        formFields: updatedFormFields
      });
      
      toast({
        title: "Field deleted",
        description: "The form field has been deleted successfully."
      });
    }
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
            <Button variant="default" asChild>
              <Link to={`/events/${eventId}/vouchers`}>
                <Ticket className="mr-2 h-4 w-4" />
                Manage Vouchers
              </Link>
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
              <Button onClick={() => setManualAddDialogOpen(true)} variant="default" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Manually
              </Button>
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditFormField(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteFormField(field.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={handleAddFormField}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  You can add, edit, or delete form fields to customize your registration form.
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

      <FormFieldDialog 
        open={formFieldDialogOpen} 
        onOpenChange={setFormFieldDialogOpen}
        field={selectedFormField}
        onSave={handleSaveFormField}
        onDelete={handleDeleteFormField}
      />



