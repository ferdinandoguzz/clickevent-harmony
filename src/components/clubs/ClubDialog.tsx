
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Club } from './ClubCard';

interface ClubDialogProps {
  club?: Club;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (club: Omit<Club, 'id' | 'memberCount' | 'eventCount' | 'createdAt'>) => void;
}

const ClubDialog: React.FC<ClubDialogProps> = ({ club, open, onOpenChange, onSave }) => {
  const [name, setName] = useState(club?.name || '');
  const [description, setDescription] = useState(club?.description || '');
  const [location, setLocation] = useState(club?.location || '');
  const [logo, setLogo] = useState<string | undefined>(club?.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Add useEffect to update form fields when club or open state changes
  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setLocation(club.location || '');
      setLogo(club.logo);
    } else {
      // Reset form fields when creating a new club
      setName('');
      setDescription('');
      setLocation('');
      setLogo(undefined);
      setLogoFile(null);
    }
  }, [club, open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      description, 
      logo, 
      location 
    });
    setName('');
    setDescription('');
    setLocation('');
    setLogo(undefined);
    setLogoFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{club ? 'Edit Club' : 'Create Club'}</DialogTitle>
            <DialogDescription>
              {club 
                ? 'Make changes to the club information here.'
                : 'Add a new club to your organization here.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Avatar className="h-20 w-20 cursor-pointer relative group border">
                {logo ? (
                  <AvatarImage src={logo} alt="Club logo" />
                ) : (
                  <AvatarFallback className="text-xl">{name ? name.substring(0, 2).toUpperCase() : 'CL'}</AvatarFallback>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </Avatar>
              <Label htmlFor="logo" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                {logo ? 'Change logo' : 'Upload logo'}
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Club Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter club name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter club location"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter club description"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{club ? 'Save changes' : 'Create club'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClubDialog;
