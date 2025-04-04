import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { mockEvents, mockAttendees } from '@/data/mockData';
import { Event, Attendee, FormField } from '@/components/events/types';
import { sendInvitationEmail } from '@/utils/emailUtils';
import { downloadQRCode } from '@/utils/downloadUtils';

export const useEventDetail = (eventId: string | undefined) => {
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
    if (!eventId) return;
    
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent as Event);
    }

    const eventAttendees = mockAttendees.filter(a => a.eventId === eventId);
    setAttendees(eventAttendees);
  }, [eventId]);

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
    (attendee.phone && attendee.phone.includes(searchQuery))
  );

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
    const qrElement = document.querySelector(`[data-attendee-id="${attendee.id}"] svg`) as SVGSVGElement;
    downloadQRCode(qrElement, `attendee-qr-${attendee.id}`);
    
    toast({
      title: "QR Code downloaded",
      description: `QR Code for ${attendee.name} has been downloaded successfully.`
    });
  };

  const handleSendInvitation = (attendee: Attendee) => {
    if (!event) return;
    
    const formattedDate = event.startDate ? formatDate(new Date(event.startDate)) : '';
    
    sendInvitationEmail(
      attendee.email,
      attendee.name,
      attendee.qrCode,
      event.name,
      formattedDate
    )
    .then(() => {
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${attendee.email}.`
      });
    })
    .catch((error) => {
      console.error('Failed to send invitation:', error);
      toast({
        title: "Error sending invitation",
        description: "There was a problem sending the invitation email.",
        variant: "destructive"
      });
    });
  };

  const handleAddAttendee = (newAttendee: Partial<Attendee>) => {
    if (!event) return;
    
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

  return {
    event,
    attendees: filteredAttendees,
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
  };
};
