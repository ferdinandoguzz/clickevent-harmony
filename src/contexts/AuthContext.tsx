
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

interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  club_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  role: UserRole;
  createUser: (name: string, email: string, password: string, role: UserRole, clubId?: string) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
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

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        
        if (newSession) {
          // Fetch user profile from our profiles table
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching user profile:', error);
              return;
            }
            
            if (profile) {
              setUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,
                clubId: profile.club_id
              });
            }
          } catch (error) {
            console.error('Error processing profile:', error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      console.log('Existing session:', existingSession);
      setSession(existingSession);
      
      if (existingSession) {
        // Fetch user profile from our profiles table
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingSession.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            setIsLoading(false);
            return;
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              clubId: profile.club_id
            });
          }
        } catch (error) {
          console.error('Error processing profile:', error);
        }
      }
      
      setIsLoading(false);
    });

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
    try {
      // Create the user in Supabase Auth with metadata
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          club_id: clubId
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
      
      // The profile should be created automatically via database trigger
      // But we'll return the user data in the expected format
      const newUser: User = {
        id: data.user.id,
        name,
        email,
        role,
        clubId
      };
      
      toast({
        title: 'User created',
        description: `${name} has been added successfully as ${role}`,
      });
      
      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      // Map profiles to users format
      return profiles.map((profile: Profile) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        clubId: profile.club_id
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
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
