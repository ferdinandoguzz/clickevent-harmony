import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash, Edit, UserCog } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string;
}

interface Club {
  id: string;
  name: string;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: { name: string; email: string; password: string; role: UserRole; clubId?: string }) => void;
  editingUser?: User;
  clubs: Club[];
}

const StaffDialog: React.FC<StaffDialogProps> = ({ open, onOpenChange, onSave, editingUser, clubs }) => {
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(editingUser?.role || 'staff');
  const [clubId, setClubId] = useState(editingUser?.clubId || '');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setPassword('');
      setRole(editingUser.role);
      setClubId(editingUser.clubId || '');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('staff');
      setClubId('');
    }
  }, [editingUser, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'staff' && !clubId) {
      toast({
        title: 'Club required',
        description: 'Staff users must be assigned to a club',
        variant: 'destructive'
      });
      return;
    }
    
    onSave({ 
      name, 
      email, 
      password, 
      role,
      ...(role === 'staff' ? { clubId } : {}) 
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Edit user information here.'
                : 'Add a new staff or admin user here.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
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
              <Label htmlFor="password">
                Password {editingUser && <span className="text-xs text-muted-foreground">(leave empty to keep current)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role || 'staff'} 
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(role === 'staff' || !role) && (
              <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <Select 
                  value={clubId} 
                  onValueChange={setClubId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingUser ? 'Save changes' : 'Create user'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const StaffManagement: React.FC = () => {
  const { role: currentUserRole, createUser, getAllUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUserRole !== 'superadmin') {
      navigate('/unauthorized');
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const usersList = await getAllUsers();
        setUsers(usersList);
        
        const { data: clubsList, error } = await supabase
          .from('clubs')
          .select('id, name');
          
        if (error) {
          console.error('Error loading clubs:', error);
          toast({
            title: 'Error',
            description: 'Could not load clubs data',
            variant: 'destructive'
          });
        } else {
          setClubs(clubsList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentUserRole, getAllUsers, navigate]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async (userData: { name: string; email: string; password: string; role: UserRole; clubId?: string }) => {
    try {
      await createUser(
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.clubId
      );
      
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the user',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw error;
      }
      
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Could not delete user',
        variant: 'destructive'
      });
    }
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500';
      case 'admin':
        return 'bg-blue-500';
      case 'staff':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getClubName = (clubId?: string) => {
    if (!clubId) return 'No club';
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Unknown club';
  };

  if (currentUserRole !== 'superadmin') {
    return null;
  }

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage admin and staff user accounts.</p>
        </div>
        <Button onClick={() => { setEditingUser(undefined); setDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreateUser}
        editingUser={editingUser}
        clubs={clubs}
      />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-background rounded-lg border shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Club</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-white`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getClubName(user.clubId)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(user)}
                        disabled={user.role === 'superadmin'}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'superadmin'}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10">
          <UserCog className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No users found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No users match your search criteria.' : 'There are no users created yet.'}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          ) : (
            <Button onClick={() => { setEditingUser(undefined); setDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create first user
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
