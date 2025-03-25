
import React, { useState, useEffect } from 'react';
import { Search, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { EventCard } from '@/components/events/EventCard';
import { EventDialog } from '@/components/events/EventDialog';
import { EmptyEventState } from '@/components/events/EmptyEventState';
import { mockEvents as eventsData } from '@/data/mockData';

const Events: React.FC = () => {
  const { role, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    // Filter events based on user role and assigned club
    if (role === 'staff' && user?.clubId) {
      // Staff users can only see events for their assigned club
      const filteredEvents = eventsData.filter(event => event.clubId === user.clubId);
      setEvents(filteredEvents);
    } else {
      // Superadmin and admin users can see all events
      setEvents(eventsData);
    }
  }, [role, user]);

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
      poster: eventData.poster
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
          <p className="text-muted-foreground">
            {role === 'staff' ? 'Manage your club\'s events.' : 'Manage your organization\'s events.'}
          </p>
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
        <EmptyEventState
          searchQuery={searchQuery}
          activeTab={activeTab}
          canCreateEvent={canCreateEvent}
          onClearSearch={() => setSearchQuery('')}
          onCreateEvent={openCreateDialog}
        />
      )}
    </div>
  );
};

export default Events;
