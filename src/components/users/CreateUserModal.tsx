import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreateUserDTO } from '@/services/UserService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDTO) => Promise<void>;
}

interface RoleOption {
  id: number;
  name: string;
  description?: string;
}

interface ClientOption {
  id: number;
  name: string;
  organization: string;
}

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const { dir } = useLanguage();
  const { token, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Data for dropdowns
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    selectedRole: '', // Temporary state for UI selection
    organizationName: '', // Maps to department/organization
    password: '',
    isActive: true
  });

  // Fetch Roles and Clients when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          // 1. Fetch Roles
          // Assuming an endpoint exists. If not, this might need to be a static list based on RoleType enum
          const rolesRes = await fetch(`${API_BASE_URL}/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (rolesRes.ok) {
            const data = await rolesRes.json();
            setRoleOptions(data);
          } else {
            // Fallback if API fails or doesn't exist yet
            console.warn("Could not fetch roles, using defaults");
            setRoleOptions([
              { id: 1, name: 'LEAD_CONSULTANT' },
              { id: 2, name: 'SUB_CONSULTANT' },
              { id: 3, name: 'MAIN_CLIENT' },
              { id: 4, name: 'SUB_CLIENT' }
            ]);
          }

          // 2. Fetch Clients (Organizations) - Only if user has permission
          if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
            const clientsRes = await fetch(`${API_BASE_URL}/clients`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (clientsRes.ok) {
              const data = await clientsRes.json();
              setClientOptions(data);
            }
          }
        } catch (error) {
          console.error("Error fetching form options:", error);
        }
      };

      fetchData();
    }
  }, [isOpen, token, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare Payload matching Java UserDTO
      const submissionData: any = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        isActive: formData.isActive,

        // Map "Organization" selection to 'department' (or 'organization' if DTO updated)
        // Since UserDTO has 'department' and 'organization' isn't explicitly in the DTO snippet provided previously
        department: formData.organizationName,

        // Map selected Role string to a List of Strings for the backend
        roles: formData.selectedRole ? [formData.selectedRole] : []
      };

      await onSubmit(submissionData);

      // Reset form
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        selectedRole: '',
        organizationName: '',
        password: '',
        isActive: true
      });
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {dir === 'rtl' ? 'إضافة مستخدم جديد' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
            <Input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. jdoe_consultant"
            />
          </div>

          {/* Name Fields */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>{dir === 'rtl' ? 'الاسم الأول' : 'First Name'}</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>{dir === 'rtl' ? 'اسم العائلة' : 'Last Name'}</Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</Label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Organization Selection (Dynamic) */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'المؤسسة / العميل' : 'Organization / Client'}</Label>
            {clientOptions.length > 0 ? (
              <Select
                value={formData.organizationName}
                onValueChange={(val) => setFormData({ ...formData, organizationName: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المؤسسة' : 'Select Organization'} />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                placeholder="Organization Name"
              />
            )}
          </div>

          {/* Role Selection (Dynamic) */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'الدور الوظيفي' : 'Role'}</Label>
            <Select
              value={formData.selectedRole}
              onValueChange={(val) => setFormData({ ...formData, selectedRole: val })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={dir === 'rtl' ? 'اختر الدور' : 'Select Role'} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.id || role.name} value={role.name}>
                    {role.name.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'كلمة المرور' : 'Password'}</Label>
            <Input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {dir === 'rtl' ? 'إنشاء' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}