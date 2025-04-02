
import React from 'react';
import { User, Mail, Phone, CalendarCheck, Clock, Check, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface AttendeeInfoProps {
  attendee: Attendee;
  onCheckIn: () => void;
}

const AttendeeInfo: React.FC<AttendeeInfoProps> = ({ attendee, onCheckIn }) => {
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
                <div>{checkinTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
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

export default AttendeeInfo;
