import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Save, Users, UserPlus, Trash2, Mail, Building, Crown, User, Loader2, Briefcase, Phone, Edit
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface Role {
  id: string;
  key: string; // e.g., LEAD_CONSULTANT
  name: string;
  nameAr: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string; // The role key
  projectRole: string;
  projectRoleEn: string;
  avatar: string;
  isActive: boolean;
}

interface EligibleUser {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
}

interface Project {
  id: string;
  title: string;
  titleEn: string;
}

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave?: () => void;
}

export function ManageTeamModal({ isOpen, onClose, project, onSave }: ManageTeamModalProps) {
  const { language, dir } = useLanguage();
  const { userProfile } = useAuth();

  // UI States
  const [activeTab, setActiveTab] = useState('current');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([]); // For Dropdown

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    role: '',
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  });

  // --- Fetch Roles ---
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/roles`, { headers: getAuthHeaders() });
      if (response.ok) setRoles(await response.json());
    } catch (error) { console.error('Failed to fetch roles', error); }
  };

  // --- Fetch Current Members ---
  const fetchMembers = async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/members`, { headers: getAuthHeaders() });
      if (response.ok) setTeamMembers(await response.json());
    } catch (error) { toast.error('Failed to fetch members'); }
    finally { setIsLoading(false); }
  };

  // --- Fetch Eligible Users (Same Org) ---
  const fetchEligibleUsers = async () => {
    if (!project?.id) return;
    try {
      // Constraint #8: Fetch users only from same organization
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/eligibleUsers`, { headers: getAuthHeaders() });
      if (response.ok) setEligibleUsers(await response.json());
    } catch (error) { console.error('Failed to fetch users', error); }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchMembers();
      fetchEligibleUsers();
      setActiveTab('current');
    }
  }, [isOpen, project]);

  // --- Constraints Validation Logic ---
  const validateConstraints = (roleKey: string) => {
    // Constraint #1: Lead Consultant <= 1
    if (roleKey === 'LEAD_CONSULTANT') {
      const hasLead = teamMembers.some(m => m.role === 'LEAD_CONSULTANT');
      if (hasLead) return language === 'ar' ? 'يوجد بالفعل استشاري رئيسي لهذا المشروع' : 'Project already has a Lead Consultant';
    }
    // Constraint #3: Main Client <= 1
    if (roleKey === 'MAIN_CLIENT') {
      const hasMainClient = teamMembers.some(m => m.role === 'MAIN_CLIENT');
      if (hasMainClient) return language === 'ar' ? 'يوجد بالفعل عميل رئيسي لهذا المشروع' : 'Project already has a Main Client';
    }
    return null;
  };

  // --- Add Member ---
  const handleSubmit = async () => {
    if (!formData.userId || !formData.role) {
      toast.error(language === 'ar' ? 'يرجى البحث عن مستخدم واختيار الدور' : 'Please search for a user and select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      // API: /api/projects/{id}/members/{userId}/{role}/add
      const url = `${API_BASE_URL}/projects/${project.id}/members/${formData.userId}/${formData.role}/add`;

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData) // Send extra fields like job title
      });

      if (!response.ok) throw new Error('Action failed');

      toast.success(language === 'ar' ? 'تمت الإضافة بنجاح' : 'Member added successfully');

      fetchMembers();
      setActiveTab('current');
      if (onSave) onSave();

    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Member ---
  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try {
      const url = `${API_BASE_URL}/projects/${project.id}/members/${member.userId}/${member.role}/delete`;
      const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Delete failed');
      setTeamMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success(language === 'ar' ? 'تم حذف العضو' : 'Member removed');
      if (onSave) onSave();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const getRoleDisplay = (roleKey: string) => {
    const role = roles.find(r => r.key === roleKey || r.name === roleKey);
    const label = role ? (language === 'ar' ? role.nameAr : role.name) : roleKey;
    const isLead = roleKey?.toLowerCase().includes('lead');
    return {
      label,
      icon: isLead ? Crown : (roleKey?.toLowerCase().includes('client') ? Building : User),
      color: isLead ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    };
  };

  const canManageTeam = userProfile?.role === 'lead_consultant' || userProfile?.role === 'super_admin';

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
              <Users className="w-6 h-6" />
              {language === 'ar' ? 'إدارة فريق المشروع' : 'Manage Project Team'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">{language === 'ar' ? 'الفريق الحالي' : 'Current Team'}</TabsTrigger>
              <TabsTrigger value="add">{language === 'ar' ? 'إضافة عضو' : 'Add Member'}</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: CURRENT MEMBERS --- */}
            <TabsContent value="current" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{language === 'ar' ? 'أعضاء الفريق' : 'Team Members'} ({teamMembers.length})</h3>
                {canManageTeam && (
                  <Button onClick={() => setActiveTab('add')} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> {language === 'ar' ? 'إضافة عضو' : 'Add Member'}
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => {
                    const roleInfo = getRoleDisplay(member.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-[#1B4FFF] text-white font-semibold">
                                  {member.avatar || (member.name ? member.name.charAt(0) : 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">{member.name}</h4>
                                <Badge variant="outline" className={`mt-1 ${roleInfo.color}`}>
                                  <RoleIcon className="w-3 h-3 mr-1" /> {roleInfo.label}
                                </Badge>
                              </div>
                            </div>
                            {canManageTeam && (
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member)} className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email}</div>
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phoneNumber}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* --- TAB 2: ADD MEMBER (Modified constraints) --- */}
            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {language === 'ar' ? 'إضافة عضو جديد' : 'Add New Team Member'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* 1. SELECT USER (Dropdown filtered by Org) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'ar' ? 'اختر العضو' : 'Select Member'}</label>
                    <Select value={formData.userId} onValueChange={(val) => setFormData(prev => ({ ...prev, userId: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر من المنظمة' : 'Select from Organization'} />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleUsers.length > 0 ? (
                          eligibleUsers.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} <span className="text-gray-400 text-xs">({user.email})</span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            {language === 'ar' ? 'لا يوجد أعضاء متاحين في هذه المنظمة' : 'No eligible members found in this organization'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. SELECT ROLE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'ar' ? 'الدور' : 'Role'}</label>

                    <Select
                      value={formData.role}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select Role'} />
                      </SelectTrigger>

                      <SelectContent>
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem
                              key={role.id || role.name}
                              // ✅ FIX: Use role.name if role.key is missing/undefined
                              value={role.key || role.name}
                            >
                              {/* Display Logic: Prefer Arabic name, fallback to English name */}
                              {language === 'ar' ? (role.nameAr || role.name) : role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            {language === 'ar' ? 'جاري التحميل...' : 'Loading roles...'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('current')}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'إضافة' : 'Add'}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}