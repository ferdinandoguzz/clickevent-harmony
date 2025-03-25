
import React from 'react';
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface EventOverviewProps {
  event: {
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    isPaid: boolean;
    price: number;
    registrationCount: number;
    maxAttendees: number;
  };
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  checkedInCount: number;
  attendeesCount: number;
}

const EventOverview: React.FC<EventOverviewProps> = ({
  event,
  formatDate,
  formatTime,
  checkedInCount,
  attendeesCount
}) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const checkedInPercentage = attendeesCount > 0 ? Math.round((checkedInCount / attendeesCount) * 100) : 0;

  return (
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
                {checkedInCount}/{attendeesCount}
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
  );
};

export default EventOverview;
