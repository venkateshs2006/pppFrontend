import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from './LanguageContext';

export type UserRole = 'lead_consultant' | 'sub_consultant' | 'main_client' | 'sub_client';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  organization: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; role: UserRole; organization: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
  hasPermission: (permission: string) => boolean;
  canAccessSection: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  lead_consultant: [
    'projects.create', 'projects.edit', 'projects.delete', 'projects.view',
    'deliverables.create', 'deliverables.edit', 'deliverables.delete', 'deliverables.view', 'deliverables.approve',
    'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
    'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.view', 'tickets.respond',
    'reports.view', 'reports.export',
    'users.create', 'users.edit', 'users.delete', 'users.view',
    'settings.edit'
  ],
  sub_consultant: [
    'projects.view',
    'deliverables.create', 'deliverables.edit', 'deliverables.view',
    'tickets.create', 'tickets.view', 'tickets.respond',
    'reports.view'
  ],
  main_client: [
    'projects.view',
    'deliverables.view', 'deliverables.comment', 'deliverables.approve',
    'tickets.create', 'tickets.view',
    'reports.view'
  ],
  sub_client: [
    'projects.view',
    'deliverables.view', 'deliverables.comment',
    'tickets.create', 'tickets.view'
  ]
};

// Section access based on roles
const sectionAccess: Record<UserRole, string[]> = {
  lead_consultant: ['dashboard', 'projects', 'deliverables', 'clients', 'tickets', 'reports', 'users', 'settings'],
  sub_consultant: ['dashboard', 'projects', 'deliverables', 'tickets', 'reports'],
  main_client: ['dashboard', 'projects', 'deliverables', 'tickets', 'reports'],
  sub_client: ['dashboard', 'projects', 'deliverables', 'tickets']
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate sign in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine role based on email for demo purposes
      let role: UserRole = 'lead_consultant';
      let organization = 'شركة البيان للاستشارات';
      
      if (email === 'lead@consultant.com') {
        role = 'lead_consultant';
        organization = 'شركة البيان للاستشارات';
      } else if (email === 'sub@consultant.com') {
        role = 'sub_consultant';
        organization = 'شركة البيان للاستشارات';
      } else if (email === 'main@client.com') {
        role = 'main_client';
        organization = 'شركة التقنية المتقدمة';
      } else if (email === 'sub@client.com') {
        role = 'sub_client';
        organization = 'شركة التقنية المتقدمة';
      }

      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        action_link: null,
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        phone: null,
        email_change: null,
        email_change_confirm_status: 0,
        banned_until: null,
        identities: []
      } as User;

      const mockProfile = {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        full_name: role === 'lead_consultant' ? 'د. فهد السعدي' : 
                   role === 'sub_consultant' ? 'محمد رشاد' :
                   role === 'main_client' ? 'سلطان منصور' : 'المهندس تركي آل نصيب',
        role,
        organization,
        phone: '+966500000000',
        avatar_url: null,
        is_active: true,
        permissions: rolePermissions[role]
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: UserRole; organization: string }) => {
    try {
      setLoading(true);
      
      // Simulate sign up
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: userData,
        aud: 'authenticated',
        confirmation_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        action_link: null,
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        phone: null,
        email_change: null,
        email_change_confirm_status: 0,
        banned_until: null,
        identities: []
      } as User;

      const mockProfile = {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        full_name: userData.full_name,
        role: userData.role,
        organization: userData.organization,
        phone: null,
        avatar_url: null,
        is_active: true,
        permissions: rolePermissions[userData.role]
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }
      return { data: null, error: new Error('No user profile found') };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    return userProfile.permissions.includes(permission);
  };

  const canAccessSection = (section: string): boolean => {
    if (!userProfile) return false;
    return sectionAccess[userProfile.role].includes(section);
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    canAccessSection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}