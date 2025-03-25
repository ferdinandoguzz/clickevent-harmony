
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FormFieldDialog } from '@/components/events/FormFieldDialog';
import { useEventDetail } from '@/hooks/useEventDetail';

// Import components
import EventOverview from '@/components/events/EventOverview';
import AttendeesTable from '@/components/events/AttendeesTable';
import EventRegistrationTab from '@/components/events/EventRegistrationTab';
import QRCodeDialog from '@/components/events/QRCodeDialog';
import ManualAttendeeForm from '@/components/events/ManualAttendeeForm';

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    event,
    attendees,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedAttendee,
    selectedFormField,
    qrDialogOpen,
    setQrDialogOpen,
    formFieldDialogOpen,
    setFormFieldDialogOpen,
    manualAddDialogOpen,
    setManualAddDialogOpen,
    checkedInCount,
    formatDate,
    formatTime,
    handleToggleCheckin,
    handleViewQR,
    handleDownloadQR,
    handleSendInvitation,
    handleAddAttendee,
    handleExportAttendees,
    handleEditFormField,
    handleAddFormField,
    handleSaveFormField,
    handleDeleteFormField
  } = useEventDetail(eventId);

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
