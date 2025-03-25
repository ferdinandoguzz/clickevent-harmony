
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Trash, Edit, UserCog, ShieldAlert } from 'lucide-react';
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
import { mockClubs } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: { name: string; email: string; password: string; role: UserRole; clubId?: string }) => void;
  editingUser?: User;
}

const StaffDialog: React.FC<StaffDialogProps> = ({ open, onOpenChange, onSave, editingUser }) => {
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(editingUser?.role || 'staff');
  const [clubId, setClubId] = useState(editingUser?.clubId || '');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setPassword(''); // Non possiamo recuperare la password, quindi campo vuoto
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
        title: 'Club richiesto',
        description: 'Per gli utenti staff è necessario selezionare un club',
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
            <DialogTitle>{editingUser ? 'Modifica Utente' : 'Crea Nuovo Utente'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Modifica le informazioni dell\'utente qui.'
                : 'Aggiungi un nuovo utente staff o admin qui.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci il nome"
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
                placeholder="email@esempio.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingUser && <span className="text-xs text-muted-foreground">(lascia vuoto per non modificare)</span>}
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
              <Label htmlFor="role">Ruolo</Label>
              <Select 
                value={role || 'staff'} 
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un ruolo" />
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
                    <SelectValue placeholder="Seleziona un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">{editingUser ? 'Salva modifiche' : 'Crea utente'}</Button>
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
  const navigate = useNavigate();

  useEffect(() => {
    // Controllo se l'utente è superadmin
    if (currentUserRole !== 'superadmin') {
      navigate('/unauthorized');
      return;
    }
    
    // Carica gli utenti
    setUsers(getAllUsers());
  }, [currentUserRole, getAllUsers, navigate]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
      
      // Aggiorna la lista degli utenti
      setUsers(getAllUsers());
    } catch (error) {
      console.error('Errore durante la creazione dell\'utente:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la creazione dell\'utente',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    // In un'applicazione reale, invieremmo una richiesta al backend
    // Per ora, simuliamo l'eliminazione dell'utente
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('clickevent_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'Utente eliminato',
      description: 'L\'utente è stato eliminato con successo',
    });
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
    if (!clubId) return 'Nessun club';
    const club = mockClubs.find(c => c.id === clubId);
    return club ? club.name : 'Club sconosciuto';
  };

  if (currentUserRole !== 'superadmin') {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gestione Staff</h1>
          <p className="text-muted-foreground">Gestisci gli account degli utenti admin e staff.</p>
        </div>
        <Button onClick={() => { setEditingUser(undefined); setDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crea Utente
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca utenti..."
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
      />

      {filteredUsers.length > 0 ? (
        <div className="bg-background rounded-lg border shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Club</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
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
                        <span className="sr-only">Modifica</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'superadmin'}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Elimina</span>
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
          <h3 className="text-lg font-medium mb-1">Nessun utente trovato</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Nessun utente corrisponde ai criteri di ricerca.' : 'Non ci sono utenti creati.'}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Cancella ricerca
            </Button>
          ) : (
            <Button onClick={() => { setEditingUser(undefined); setDialogOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crea il primo utente
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
