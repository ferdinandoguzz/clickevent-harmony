
import React from 'react';
import { Info, Plus, Edit, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import RegistrationForm from './RegistrationForm';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface Attendee {
  id?: string;
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

interface EventRegistrationTabProps {
  event: {
    id: string;
    name: string;
    formFields: FormField[];
  };
  onAddAttendee: (attendee: Partial<Attendee>) => void;
  handleEditFormField: (field: FormField) => void;
  handleDeleteFormField: (fieldId: string) => void;
  handleAddFormField: () => void;
}

const EventRegistrationTab: React.FC<EventRegistrationTabProps> = ({
  event,
  onAddAttendee,
  handleEditFormField,
  handleDeleteFormField,
  handleAddFormField
}) => {
  return (
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
            <RegistrationForm event={event} onAddAttendee={onAddAttendee} />
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
  );
};

export default EventRegistrationTab;
