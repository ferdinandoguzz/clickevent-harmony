
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image } from 'lucide-react';
import { Event, Club } from '@/types/event';
import { toast } from '@/hooks/use-toast';

// Make sure mockClubs is imported from the mock data for now
import { mockClubs as clubs } from '@/data/mockData';

interface EventDialogProps {
  event?: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (eventData: Partial<Event>) => void;
}

export const EventDialog: React.FC<EventDialogProps> = ({ 
  event, 
  open, 
  onOpenChange, 
  onSave 
}) => {
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
  const [poster, setPoster] = useState<string | undefined>(event?.poster);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  // Aggiunto useEffect per aggiornare i campi del form quando cambia l'evento
  useEffect(() => {
    if (event) {
      setName(event.name || '');
      setDescription(event.description || '');
      setClubId(event.clubId || '');
      setLocation(event.location || '');
      
      // Gestione delle date e orari
      if (event.startDate) {
        const [date, time] = event.startDate.split('T');
        setStartDate(date);
        setStartTime(time ? time.substring(0, 5) : '');
      }
      
      if (event.endDate) {
        const [date, time] = event.endDate.split('T');
        setEndDate(date);
        setEndTime(time ? time.substring(0, 5) : '');
      }
      
      setMaxAttendees(event.maxAttendees?.toString() || '100');
      setIsPaid(event.isPaid || false);
      setPrice(event.price?.toString() || '0');
      setPoster(event.poster);
      setPosterFile(null);
    } else {
      // Reset del form per la creazione di un nuovo evento
      setName('');
      setDescription('');
      setClubId('');
      setLocation('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setMaxAttendees('100');
      setIsPaid(false);
      setPrice('0');
      setPoster(undefined);
      setPosterFile(null);
    }
  }, [event, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Errore",
          description: "Il file deve essere un'immagine",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the file is not too big (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Errore",
          description: "L'immagine è troppo grande. Dimensione massima: 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // For demo purposes, create a data URL to display the image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPoster(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Store the file for later processing
      setPosterFile(file);
    }
  };
  
  const removePoster = () => {
    setPoster(undefined);
    setPosterFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Partial<Event> = {
      name,
      description,
      clubId,
      clubName: clubs.find(club => club.id === clubId)?.name || '',
      location,
      startDate: `${startDate}T${startTime}:00`,
      endDate: `${endDate}T${endTime}:00`,
      maxAttendees: parseInt(maxAttendees),
      isPaid,
      price: isPaid ? parseFloat(price) : 0,
      status: 'upcoming',
      poster: poster
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
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Event Poster</Label>
              {poster ? (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                  <img src={poster} alt="Event poster" className="w-full max-h-[200px] object-cover" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={removePoster}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:bg-accent/50 transition-colors">
                  <Input
                    id="poster"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="poster" className="flex flex-col items-center cursor-pointer">
                    <Image className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-sm font-medium mb-1">Carica la locandina dell'evento</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, GIF fino a 5MB
                    </span>
                  </Label>
                </div>
              )}
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
