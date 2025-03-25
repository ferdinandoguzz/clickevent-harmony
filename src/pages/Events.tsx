import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MoreHorizontal, CalendarPlus, Trash, Edit, Users, Calendar, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockEvents = [
  {
    id: '1',
    name: 'Tech Conference 2023',
    description: 'Annual tech conference featuring the latest in technology trends.',
    clubId: '1',
    clubName: 'Tech Enthusiasts',
    location: 'Convention Center, New York',
    startDate: '2023-06-15T09:00:00',
    endDate: '2023-06-15T17:00:00',
    registrationCount: 45,
    maxAttendees: 100,
    isPaid: true,
    price: 49.99,
    status: 'upcoming' as const,
  },
  {
    id: '2',
    name: 'Networking Mixer',
    description: 'Evening networking event for professionals.',
    clubId: '2',
    clubName: 'Business Network',
    location: 'Downtown Hotel, Chicago',
    startDate: '2023-07-02T18:00:00',
    endDate: '2023-07-02T21:00:00',
    registrationCount: 32,
    maxAttendees: 75,
    isPaid: true,
    price: 25,
    status: 'upcoming' as const,
  },
  {
    id: '3',
    name: 'Art Exhibition',
    description: 'Showcasing local artists and their work.',
    clubId: '3',
    clubName: 'Creative Arts',
    location: 'Community Gallery, Los Angeles',
    startDate: '2023-08-10T10:00:00',
    endDate: '2023-08-12T18:00:00',
    registrationCount: 78,
    maxAttendees: 150,
    isPaid: false,
    price: 0,
    status: 'upcoming' as const,
  },
  {
    id: '4',
    name: 'Wellness Workshop',
    description: 'Learn about holistic wellness practices.',
    clubId: '4',
    clubName: 'Health & Wellness',
    location: 'Community Center, Austin',
    startDate: '2023-05-20T09:00:00',
    endDate: '2023-05-20T12:00:00',
    registrationCount: 28,
    maxAttendees: 30,
    isPaid: true,
    price: 15,
    status: 'past' as const,
  },
  {
    id: '5',
    name: 'Leadership Seminar',
    description: 'Developing effective leadership skills.',
    clubId: '2',
    clubName: 'Business Network',
    location: 'Business Center, Dallas',
    startDate: '2023-04-15T10:00:00',
    endDate: '2023-04-15T16:00:00',
    registrationCount: 42,
    maxAttendees: 50,
    isPaid: true,
    price: 35,
    status: 'past' as const,
  },
];

// Mock clubs from the previous page
const mockClubs = [
  { id: '1', name: 'Tech Enthusiasts' },
  { id: '2', name: 'Business Network' },
  { id: '3', name: 'Creative Arts' },
  { id: '4', name: 'Health & Wellness' },
];

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
}

const EventCard: React.FC<{ event: Event; onEdit: (event: Event) => void; onDelete: (event: Event) => void }> = ({ 
  event, 
  onEdit, 
  onDelete 
}) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

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

const EventDialog: React.FC<{
  event?: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (eventData: Partial<Event>) => void;
}> = ({ event, open, onOpenChange, onSave }) => {
  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [clubId, setClubId] = useState(event?.clubId || '');
  const [location, setLocation] = useState(event?.location || '');
  const [startDate, setStartDate] = useState(event?.startDate ? event.startDate.split('T')[0] : '');
  const [startTime, setStartTime] = useState(event?.startDate ? event.startDate.split('T')[1].substring(0, 5) : '');
  const [endDate, setEndDate] = useState(event?.endDate ? event.endDate.split('T')[0] : '');
  const [endTime, setEndTime] = useState(event?.endDate ? event.endDate.split('T')[1].substring(0, 5) : '');
  const [maxAttendees, setMaxAttendees] = useState(event?.maxAttendees?.toString() || '100');
  const [isPaid, setIsPaid] = useState(event?.isPaid || false);
  const [price, setPrice] = useState(event?.price?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Partial<Event> = {
      name,
      description,
      clubId,
      clubName: mockClubs.find(club => club.id === clubId)?.name || '',
      location,
      startDate: `${startDate}T${startTime}:00`,
      endDate: `${endDate}T${endTime}:00`,
      maxAttendees: parseInt(maxAttendees),
      isPaid,
      price: isPaid ? parseFloat(price) : 0,
      status: 'upcoming',
    };
    
    onSave(eventData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {event 
                ? 'Make changes to the event details here.'
                : 'Create a new event for your organization here.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter event name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <Select value={clubId} onValueChange={setClubId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPaid">Paid Event</Label>
                  <Switch
                    id="isPaid"
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>
                {isPaid && (
                  <div className="mt-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{event ? 'Save changes' : 'Create event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Events: React.FC = () => {
  const { role } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  const filteredEvents = events.filter(event => 
    (event.status === activeTab) &&
    (event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateEvent = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      name: eventData.name || '',
      description: eventData.description || '',
      clubId: eventData.clubId || '',
      clubName: eventData.clubName || '',
      location: eventData.location || '',
      startDate: eventData.startDate || '',
      endDate: eventData.endDate || '',
      registrationCount: 0,
      maxAttendees: eventData.maxAttendees || 0,
      isPaid: eventData.isPaid || false,
      price: eventData.price || 0,
      status: 'upcoming',
    };
    
    setEvents([newEvent, ...events]);
    toast({
      title: 'Event created',
      description: `${newEvent.name} has been successfully created.`,
    });
  };

  const handleEditEvent = (eventData: Partial<Event>) => {
    if (!editingEvent) return;
    
    const updatedEvents = events.map(event => 
      event.id === editingEvent.id 
        ? { ...event, ...eventData } 
        : event
    );
    
    setEvents(updatedEvents);
    setEditingEvent(undefined);
    toast({
      title: 'Event updated',
      description: `${eventData.name} has been successfully updated.`,
    });
  };

  const handleDeleteEvent = (event: Event) => {
    setEvents(events.filter(e => e.id !== event.id));
    toast({
      title: 'Event deleted',
      description: `${event.name} has been successfully deleted.`,
    });
  };

  const openCreateDialog = () => {
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const canCreateEvent = role === 'superadmin' || role === 'admin';

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Events</h1>
          <p className="text-muted-foreground">Manage your organization's events.</p>
        </div>
        {canCreateEvent && (
          <Button onClick={openCreateDialog}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div className="relative w-full md:w-auto md:flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={editingEvent ? handleEditEvent : handleCreateEvent}
      />

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={openEditDialog}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <CalendarPlus className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'No events match your search criteria.' 
              : activeTab === 'upcoming' 
                ? 'There are no upcoming events scheduled.'
                : activeTab === 'past'
                  ? 'There are no past events.'
                  : 'There are no draft events.'}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          ) : canCreateEvent ? (
            <Button onClick={openCreateDialog}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Create your first event
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Events;
