import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, MoreHorizontal, Building, Trash, Edit, Users, UserPlus } from 'lucide-react';
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
import { mockClubs } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  eventCount: number;
  createdAt: string;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: { name: string; email: string; password: string; clubId: string }) => void;
  clubId: string;
  clubName: string;
}

const StaffDialog: React.FC<StaffDialogProps> = ({ open, onOpenChange, onSave, clubId, clubName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, password, clubId });
    setName('');
    setEmail('');
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Staff User</DialogTitle>
            <DialogDescription>
              Add a new staff user for {clubName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter staff name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ClubCard: React.FC<{ 
  club: Club; 
  onEdit: (club: Club) => void; 
  onDelete: (club: Club) => void;
  onCreateStaff: (club: Club) => void;
}> = ({ 
  club, 
  onEdit, 
  onDelete,
  onCreateStaff
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
              <DropdownMenuItem onClick={() => onCreateStaff(club)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create staff user
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
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Created on {new Date(club.createdAt).toLocaleDateString()}
        </span>
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
  const { createUser } = useAuth();
  const [clubs, setClubs] = useState<Club[]>(mockClubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | undefined>(undefined);
  const [selectedClub, setSelectedClub] = useState<Club | undefined>(undefined);

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

  const handleCreateStaffUser = (userData: { name: string; email: string; password: string; clubId: string }) => {
    try {
      createUser(
        userData.name,
        userData.email,
        userData.password,
        'staff',
        userData.clubId
      );
      
      toast({
        title: 'Staff user created',
        description: `Staff user for ${selectedClub?.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating staff user:', error);
      toast({
        title: 'Error',
        description: 'There was an error creating the staff user.',
        variant: 'destructive'
      });
    }
  };

  const openCreateClubDialog = () => {
    setEditingClub(undefined);
    setClubDialogOpen(true);
  };

  const openEditClubDialog = (club: Club) => {
    setEditingClub(club);
    setClubDialogOpen(true);
  };

  const openCreateStaffDialog = (club: Club) => {
    setSelectedClub(club);
    setStaffDialogOpen(true);
  };

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Clubs</h1>
          <p className="text-muted-foreground">Manage your organizations and clubs.</p>
        </div>
        <Button onClick={openCreateClubDialog}>
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
        open={clubDialogOpen}
        onOpenChange={setClubDialogOpen}
        club={editingClub}
        onSave={editingClub ? handleEditClub : handleCreateClub}
      />

      {selectedClub && (
        <StaffDialog
          open={staffDialogOpen}
          onOpenChange={setStaffDialogOpen}
          onSave={handleCreateStaffUser}
          clubId={selectedClub.id}
          clubName={selectedClub.name}
        />
      )}

      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <ClubCard
              key={club.id}
              club={club}
              onEdit={openEditClubDialog}
              onDelete={handleDeleteClub}
              onCreateStaff={openCreateStaffDialog}
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
            <Button onClick={openCreateClubDialog}>
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
