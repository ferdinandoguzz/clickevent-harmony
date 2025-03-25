
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { mockEvents, mockAttendees } from '@/data/mockData';
import { FormFieldDialog } from '@/components/events/FormFieldDialog';

// Import types
import { Event, Attendee, FormField } from '@/components/events/types';

// Import components
import EventOverview from '@/components/events/EventOverview';
import AttendeesTable from '@/components/events/AttendeesTable';
import EventRegistrationTab from '@/components/events/EventRegistrationTab';
import QRCodeDialog from '@/components/events/QRCodeDialog';
import ManualAttendeeForm from '@/components/events/ManualAttendeeForm';

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

  const checkedInCount = attendees.filter(a => a.checkedIn).length;

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
          <EventOverview 
            event={event} 
            formatDate={formatDate} 
            formatTime={formatTime} 
            checkedInCount={checkedInCount}
            attendeesCount={attendees.length}
          />
        </TabsContent>
        
        <TabsContent value="attendees" className="pt-6">
          <AttendeesTable 
            attendees={attendees}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setManualAddDialogOpen={setManualAddDialogOpen}
            handleExportAttendees={handleExportAttendees}
            handleViewQR={handleViewQR}
            handleSendInvitation={handleSendInvitation}
            handleToggleCheckin={handleToggleCheckin}
          />
        </TabsContent>
        
        <TabsContent value="registration" className="pt-6">
          <EventRegistrationTab 
            event={event}
            onAddAttendee={handleAddAttendee}
            handleEditFormField={handleEditFormField}
            handleDeleteFormField={handleDeleteFormField}
            handleAddFormField={handleAddFormField}
          />
        </TabsContent>
      </Tabs>

      <QRCodeDialog 
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        attendee={selectedAttendee}
        onSendInvitation={handleSendInvitation}
        onDownloadQR={handleDownloadQR}
      />

      <FormFieldDialog 
        open={formFieldDialogOpen} 
        onOpenChange={setFormFieldDialogOpen}
        field={selectedFormField}
        onSave={handleSaveFormField}
        onDelete={handleDeleteFormField}
      />
      
      <ManualAttendeeForm
        eventId={event.id}
        onAddAttendee={handleAddAttendee}
        open={manualAddDialogOpen}
        onOpenChange={setManualAddDialogOpen}
      />
    </div>
  );
};

export default EventDetail;
