import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from './LanguageContext';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'lead_consultant'
  | 'sub_consultant'
  | 'main_client'
  | 'sub_client';

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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Helper: Define ALL permissions in one place to assign to admins easily
const ALL_PERMISSIONS = [
  'projects.create', 'projects.edit', 'projects.delete', 'projects.view',
  'deliverables.create', 'deliverables.edit', 'deliverables.delete', 'deliverables.view', 'deliverables.approve', 'deliverables.comment',
  'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
  'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.view', 'tickets.respond',
  'reports.view', 'reports.export',
  'users.create', 'users.edit', 'users.delete', 'users.view',
  'settings.edit'
];

// 2. UPDATE: Add permissions for super_admin and admin
const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS, // Admin has full permissions (scope limited by backend usually)
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

// 3. UPDATE: Grant access to all sections for super_admin and admin
const sectionAccess: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'projects', 'deliverables', 'clients', 'tickets', 'reports', 'users', 'settings'],
  admin: ['dashboard', 'projects', 'deliverables', 'clients', 'tickets', 'reports', 'users', 'settings'],
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
      // --- ADD YOUR BACKEND CALL HERE ---
      // Example:
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Save token if your backend returns one
      localStorage.setItem('accessToken', data.data.refreshToken);
      console.log(data);
      const mockUser = {
        id: data.data.username,
        email: data.data.email,
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
      console.log("User Details :", mockUser)
      console.log("Role Details :", data.data.role)
      // Set the user and profile state based on REAL response
      const mockProfile = {
        id: data.username,
        user_id: data.username,
        full_name: data.username,
        role: data.data.role,
        organization: data.organization,
        phone: '+966500000000',
        avatar_url: null,
        is_active: true,
        permissions: rolePermissions[data.data.role]
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      return { data: data.user, error: null };
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