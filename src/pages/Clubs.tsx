
import React, { useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { mockClubs } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

import ClubCard, { Club } from '@/components/clubs/ClubCard';
import ClubDialog from '@/components/clubs/ClubDialog';
import StaffDialog from '@/components/clubs/StaffDialog';
import EmptyClubState from '@/components/clubs/EmptyClubState';

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
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (club.location && club.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateClub = (clubData: Omit<Club, 'id' | 'memberCount' | 'eventCount' | 'createdAt'>) => {
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: clubData.name,
      description: clubData.description,
      logo: clubData.logo,
      location: clubData.location,
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
        ? { 
            ...club, 
            name: clubData.name, 
            description: clubData.description,
            logo: clubData.logo,
            location: clubData.location
          } 
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

  const clearSearch = () => {
    setSearchQuery('');
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
        <EmptyClubState 
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
          onCreateClub={openCreateClubDialog}
        />
      )}
    </div>
  );
};

export default Clubs;
