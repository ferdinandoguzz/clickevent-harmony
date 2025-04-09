
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'staff' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string; // Club associated with staff user
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        
        if (newSession) {
          // Fetch user metadata from profiles or roles table
          // For now we'll use mock data for demo accounts
          const email = newSession.user.email;
          if (email) {
            let role: UserRole = 'staff';
            let name = email.split('@')[0];
            
            if (email.includes('superadmin')) {
              role = 'superadmin';
            } else if (email.includes('admin')) {
              role = 'admin';
            }
            
            const userObj: User = {
              id: newSession.user.id,
              name,
              email,
              role
            };
            
            setUser(userObj);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log('Existing session:', existingSession);
      setSession(existingSession);
      
      if (existingSession) {
        // Fetch user metadata from profiles or roles table
        // For now we'll use mock data for demo accounts
        const email = existingSession.user.email;
        if (email) {
          let role: UserRole = 'staff';
          let name = email.split('@')[0];
          
          if (email.includes('superadmin')) {
            role = 'superadmin';
          } else if (email.includes('admin')) {
            role = 'admin';
          }
          
          const userObj: User = {
            id: existingSession.user.id,
            name,
            email,
            role
          };
          
          setUser(userObj);
        }
      }
      
      setIsLoading(false);
    });
    
    // Load mock users (in a real app, these would come from the database)
    const savedUsers = localStorage.getItem('clickevent_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error parsing saved users data', e);
        localStorage.removeItem('clickevent_users');
      }
    } else {
      // Initialize with some default users if none exist
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

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Note: We rely on onAuthStateChange to update the user state
      toast({
        title: 'Successfully logged in',
        description: `Welcome back!`
      });
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error logging out',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setUser(null);
    setSession(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const createUser = async (name: string, email: string, password: string, role: UserRole, clubId?: string): Promise<User> => {
    // In a real app, we would create the user in Supabase Auth
    // For now, simulate user creation
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        clubId
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error creating user',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    // Create a user object and add it to our local users array
    const newUser: User = {
      id: data.user.id,
      name,
      email,
      role,
      clubId
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Save in localStorage for demo purposes
    localStorage.setItem('clickevent_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'User created',
      description: `${name} has been added successfully as ${role}`,
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
