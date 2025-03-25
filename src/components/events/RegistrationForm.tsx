
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

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

interface RegistrationFormProps {
  event: {
    id: string;
    formFields: FormField[];
  };
  onAddAttendee: (attendee: Partial<Attendee>) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
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

export default RegistrationForm;
