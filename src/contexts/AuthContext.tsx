
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'superadmin' | 'admin' | 'staff' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string; // Club associato all'utente staff
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  role: UserRole;
  createUser: (name: string, email: string, password: string, role: UserRole, clubId?: string) => Promise<User>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedUser = localStorage.getItem('clickevent_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user data', e);
        localStorage.removeItem('clickevent_user');
      }
    }
    
    // Carica gli utenti salvati
    const savedUsers = localStorage.getItem('clickevent_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error parsing saved users data', e);
        localStorage.removeItem('clickevent_users');
      }
    } else {
      // Inizializza con alcuni utenti di default se non ce ne sono
      const defaultUsers = [
        {
          id: 'superadmin-1',
          name: 'Super Admin',
          email: 'superadmin@clickevent.com',
          role: 'superadmin' as UserRole
        },
        {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@clickevent.com',
          role: 'admin' as UserRole
        },
        {
          id: 'staff-1',
          name: 'Staff',
          email: 'staff@clickevent.com',
          role: 'staff' as UserRole
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('clickevent_users', JSON.stringify(defaultUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Verifica se l'utente esiste nella lista degli utenti
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && password) {
        setUser(foundUser);
        localStorage.setItem('clickevent_user', JSON.stringify(foundUser));
        toast({
          title: 'Successfully logged in',
          description: `Welcome back, ${foundUser.name}!`
        });
      } else {
        // Fallback al comportamento precedente per demo
        if (email && password) {
          // Simulate role based on email for demo purposes
          let role: UserRole = null;
          
          if (email.includes('superadmin')) {
            role = 'superadmin';
          } else if (email.includes('admin')) {
            role = 'admin';
          } else if (email.includes('staff')) {
            role = 'staff';
          } else {
            throw new Error('Invalid user role');
          }
          
          const newUser: User = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role
          };
          
          setUser(newUser);
          localStorage.setItem('clickevent_user', JSON.stringify(newUser));
          toast({
            title: 'Successfully logged in',
            description: `Welcome back, ${newUser.name}!`
          });
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      toast({
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clickevent_user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const createUser = async (name: string, email: string, password: string, role: UserRole, clubId?: string): Promise<User> => {
    // In un'applicazione reale, qui invieremmo una richiesta al backend
    // Per ora, simuliamo la creazione dell'utente
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      clubId
    };
    
    // Aggiungi l'utente alla lista
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Salva nel localStorage
    localStorage.setItem('clickevent_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'Utente creato',
      description: `${name} è stato aggiunto con successo come ${role}`,
    });
    
    return newUser;
  };

  const getAllUsers = (): User[] => {
    return users;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        role: user?.role || null,
        createUser,
        getAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
