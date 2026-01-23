import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreateUpdateUserRequest, ApiUser } from '@/services/userService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Edit, UserPlus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: ApiUser | null;
  onSubmit: (data: CreateUpdateUserRequest) => Promise<void>;
}

interface RoleOption {
  id: number;
  name: string;
}

interface ClientOption {
  id: number;
  name: string;
}

export function UserFormDialog({ open, onOpenChange, userToEdit, onSubmit }: UserFormDialogProps) {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const token = localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);

  // Data for dropdowns
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);

  // Password Logic
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form State
  const [formData, setFormData] = useState<CreateUpdateUserRequest & { selectedRole: string }>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    password: '',
    isActive: true,
    roles: [],
    selectedRole: ''
  });

  // 1. Fetch Options
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          const rolesRes = await fetch(`${API_BASE_URL}/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (rolesRes.ok) {
            const data = await rolesRes.json();
            setRoleOptions(data);
          }

          const clientsRes = await fetch(`${API_BASE_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (clientsRes.ok) {
            const data = await clientsRes.json();
            setClientOptions(data);
          }
        } catch (error) {
          console.error("Error fetching options:", error);
        }
      };
      fetchOptions();
    }
  }, [open, token]);

  // 2. Populate Form
  useEffect(() => {
    if (open) {
      setConfirmPassword('');
      setIsResettingPassword(false);

      if (userToEdit) {
        const currentRole = userToEdit.roles && userToEdit.roles.length > 0
          ? userToEdit.roles[0]
          : '';

        setFormData({
          id: userToEdit.id,
          username: userToEdit.username,
          email: userToEdit.email,
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          phoneNumber: userToEdit.phoneNumber || '',
          department: userToEdit.department || '',
          password: '',
          isActive: userToEdit.isActive,
          roles: userToEdit.roles || [],
          selectedRole: currentRole
        });
      } else {
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          department: '',
          password: '',
          isActive: true,
          roles: [],
          selectedRole: ''
        });
        setIsResettingPassword(true);
      }
    }
  }, [userToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCreateMode = !userToEdit;
    const shouldValidatePassword = isCreateMode || isResettingPassword;

    if (shouldValidatePassword && !formData.password) {
      toast({ variant: "destructive", title: "Error", description: "Password is required" });
      return;
    }
    if (shouldValidatePassword && formData.password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }
    if (!formData.selectedRole) {
      toast({ variant: "destructive", title: "Error", description: "Role is required" });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateUpdateUserRequest = {
        ...formData,
        // Ensure role is sent as a single-item array, formatted correctly
        roles: [formData.selectedRole],
        fullName: `${formData.firstName} ${formData.lastName}`
      };

      // Debugging: Log payload to see what's being sent
      console.log("Submitting User Update:", payload);

      if (!shouldValidatePassword) delete payload.password;
      delete (payload as any).selectedRole;

      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save user" });
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (userToEdit) return dir === 'rtl' ? 'تعديل المستخدم' : 'Edit User';
    return dir === 'rtl' ? 'إضافة مستخدم جديد' : 'Add New User';
  };

  const getDialogIcon = () => {
    if (userToEdit) return <Edit className="w-5 h-5 text-orange-600" />;
    return <UserPlus className="w-5 h-5 text-green-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDialogIcon()}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'الاسم الأول' : 'First Name'}</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'اسم العائلة' : 'Last Name'}</Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
            <Input
              required
              disabled={!!userToEdit?.id}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone'}</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Role & Organization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'الدور الوظيفي' : 'Role'}</Label>
              <Select
                key={formData.selectedRole}
                value={formData.selectedRole}
                onValueChange={(val) => setFormData({ ...formData, selectedRole: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر الدور' : 'Select Role'} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'المؤسسة' : 'Organization'}</Label>
              {clientOptions.length > 0 ? (
                <Select
                  key={formData.department}
                  value={formData.department}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
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
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={dir === 'rtl' ? 'اسم المؤسسة' : 'Organization Name'}
                />
              )}
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-4 mt-2">
            {userToEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="reset-password-mode" className="cursor-pointer font-medium">
                  {dir === 'rtl' ? 'تغيير كلمة المرور؟' : 'Reset Password?'}
                </Label>
                <Switch
                  id="reset-password-mode"
                  checked={isResettingPassword}
                  onCheckedChange={setIsResettingPassword}
                />
              </div>
            )}

            {isResettingPassword && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                  <Input
                    type="password"
                    required
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...') : (dir === 'rtl' ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}