
import React, { useState } from 'react';
import { PlusCircle, Search, MoreHorizontal, Building, Trash, Edit, Users } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// Mock data
const mockClubs = [
  {
    id: '1',
    name: 'Tech Enthusiasts',
    description: 'A club for technology enthusiasts and professionals.',
    memberCount: 125,
    eventCount: 8,
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    name: 'Business Network',
    description: 'Professional networking for business leaders.',
    memberCount: 89,
    eventCount: 5,
    createdAt: '2023-02-15',
  },
  {
    id: '3',
    name: 'Creative Arts',
    description: 'A community for artists and creative professionals.',
    memberCount: 67,
    eventCount: 3,
    createdAt: '2023-03-22',
  },
  {
    id: '4',
    name: 'Health & Wellness',
    description: 'Focus on healthy living and wellness practices.',
    memberCount: 42,
    eventCount: 2,
    createdAt: '2023-04-05',
  },
];

interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  eventCount: number;
  createdAt: string;
}

const ClubCard: React.FC<{ club: Club; onEdit: (club: Club) => void; onDelete: (club: Club) => void }> = ({ 
  club, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>{club.name}</CardTitle>
            <CardDescription className="mt-1">{club.description}</CardDescription>
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
              <DropdownMenuItem onClick={() => onEdit(club)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit club
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(club)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete club
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{club.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{club.eventCount} events</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Created on {new Date(club.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};

const ClubDialog: React.FC<{
  club?: Club;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (club: Omit<Club, 'id' | 'memberCount' | 'eventCount' | 'createdAt'>) => void;
}> = ({ club, open, onOpenChange, onSave }) => {
  const [name, setName] = useState(club?.name || '');
  const [description, setDescription] = useState(club?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
    setName('');
    setDescription('');
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

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>(mockClubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | undefined>(undefined);

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClub = (clubData: Omit<Club, 'id' | 'memberCount' | 'eventCount' | 'createdAt'>) => {
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: clubData.name,
      description: clubData.description,
      memberCount: 0,
      eventCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setClubs([newClub, ...clubs]);
    toast({
      title: 'Club created',
      description: `${newClub.name} has been successfully created.`,
    });
  };

  const handleEditClub = (clubData: Omit<Club, 'id' | 'memberCount' | 'eventCount' | 'createdAt'>) => {
    if (!editingClub) return;
    
    const updatedClubs = clubs.map(club => 
      club.id === editingClub.id 
        ? { ...club, name: clubData.name, description: clubData.description } 
        : club
    );
    
    setClubs(updatedClubs);
    setEditingClub(undefined);
    toast({
      title: 'Club updated',
      description: `${clubData.name} has been successfully updated.`,
    });
  };

  const handleDeleteClub = (club: Club) => {
    setClubs(clubs.filter(c => c.id !== club.id));
    toast({
      title: 'Club deleted',
      description: `${club.name} has been successfully deleted.`,
    });
  };

  const openCreateDialog = () => {
    setEditingClub(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (club: Club) => {
    setEditingClub(club);
    setDialogOpen(true);
  };

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Clubs</h1>
          <p className="text-muted-foreground">Manage your organizations and clubs.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Club
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ClubDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        club={editingClub}
        onSave={editingClub ? handleEditClub : handleCreateClub}
      />

      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <ClubCard
              key={club.id}
              club={club}
              onEdit={openEditDialog}
              onDelete={handleDeleteClub}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Building className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No clubs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No clubs match your search criteria.' : 'There are no clubs created yet.'}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          ) : (
            <Button onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first club
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Clubs;
