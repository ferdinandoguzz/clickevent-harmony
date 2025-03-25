
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
import { MoreHorizontal, Users, Edit, Trash, Ticket, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
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
    <Card className="hover-lift event-card overflow-hidden border-purple-100">
      <CardHeader className="card-header-gradient">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={event.isPaid ? "event-paid-badge" : "event-free-badge"}>
                {event.isPaid ? `$${event.price}` : 'Free'}
              </Badge>
              <Badge variant="secondary" className={
                event.status === 'upcoming' 
                  ? 'bg-blue-100 text-blue-800' 
                  : event.status === 'past' 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-amber-100 text-amber-800'
              }>
                {event.status === 'upcoming' ? 'Upcoming' : event.status === 'past' ? 'Past' : 'Draft'}
              </Badge>
            </div>
            <CardTitle className="text-purple-900">{event.name}</CardTitle>
            <CardDescription className="mt-1 text-purple-700">{event.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-blue-600 hover:text-blue-800 focus:text-blue-800 hover:bg-blue-50 focus:bg-blue-50">
                <Link to={`/events/${event.id}`}>
                  <Users className="mr-2 h-4 w-4" />
                  View attendees
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-indigo-600 hover:text-indigo-800 focus:text-indigo-800 hover:bg-indigo-50 focus:bg-indigo-50">
                <Link to={`/events/${event.id}/vouchers`}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Manage vouchers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-sky-600 hover:text-sky-800 focus:text-sky-800 hover:bg-sky-50 focus:bg-sky-50">
                <Link to={`/event/${event.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Landing Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQrCode(!showQrCode)} className="text-amber-600 hover:text-amber-800 focus:text-amber-800 hover:bg-amber-50 focus:bg-amber-50">
                <Ticket className="mr-2 h-4 w-4" />
                {showQrCode ? 'Hide Voucher QR Code' : 'Show Voucher QR Code'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)} className="text-emerald-600 hover:text-emerald-800 focus:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50">
                <Edit className="mr-2 h-4 w-4" />
                Edit event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(event)} className="text-rose-600 hover:text-rose-800 focus:text-rose-800 hover:bg-rose-50 focus:bg-rose-50">
                <Trash className="mr-2 h-4 w-4" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {showQrCode && (
          <div className="mb-4 flex justify-center">
            <QRCodeDisplay value={voucherCode} size="sm" />
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>
            {formatDate(startDate)} {startDate.toDateString() !== endDate.toDateString() ? `- ${formatDate(endDate)}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <Clock className="h-4 w-4 text-purple-500" />
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <MapPin className="h-4 w-4 text-purple-500" />
          <span>{event.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 py-3">
        <div className="text-sm font-medium text-purple-700">{event.clubName}</div>
        <div className="text-sm font-medium text-indigo-700">{event.registrationCount}/{event.maxAttendees} registered</div>
      </CardFooter>
    </Card>
  );
};
