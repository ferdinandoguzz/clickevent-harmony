
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Edit, Trash, Ticket, Calendar, MapPin, Clock } from 'lucide-react';
import { Event } from '@/types/event';
import { QRCodeDisplay } from '@/components/vouchers/QRCodeDisplay';
import { mockVouchers } from '@/data/mockData';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Get sample voucher for this event if any
  const eventVoucher = mockVouchers.find(v => v.eventId === event.id);
  const voucherCode = eventVoucher ? eventVoucher.qrCode : `EVENT-${event.id}-VOUCHER`;

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={event.isPaid ? "default" : "outline"}>
                {event.isPaid ? `$${event.price}` : 'Free'}
              </Badge>
              <Badge variant="secondary">
                {event.status === 'upcoming' ? 'Upcoming' : event.status === 'past' ? 'Past' : 'Draft'}
              </Badge>
            </div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription className="mt-1">{event.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}`}>
                  <Users className="mr-2 h-4 w-4" />
                  View attendees
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}/vouchers`}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Manage vouchers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQrCode(!showQrCode)}>
                <Ticket className="mr-2 h-4 w-4" />
                {showQrCode ? 'Hide Voucher QR Code' : 'Show Voucher QR Code'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(event)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showQrCode && (
          <div className="mb-4 flex justify-center">
            <QRCodeDisplay value={voucherCode} size="sm" />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {formatDate(startDate)} {startDate.toDateString() !== endDate.toDateString() ? `- ${formatDate(endDate)}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{event.clubName}</div>
        <div className="text-sm font-medium">{event.registrationCount}/{event.maxAttendees} registered</div>
      </CardFooter>
    </Card>
  );
};
