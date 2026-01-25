import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Edit, UserPlus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// --- Interfaces ---
interface UserDTO {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
  isActive: boolean;
  role: string;
  clientId?: number; // ✅ Changed from organizationId to clientId
  jobTitle?: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: any | null;
  onSubmit: (data: any) => Promise<void>;
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
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    jobTitle: '',
    password: '',
    isActive: true,
    role: '',
    clientId: '' // ✅ Renamed state variable
  });

  // 1. Fetch Options
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          const rolesRes = await fetch(`${API_BASE_URL}/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (rolesRes.ok) setRoleOptions(await rolesRes.json());

          const clientsRes = await fetch(`${API_BASE_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (clientsRes.ok) setClientOptions(await clientsRes.json());
        } catch (error) {
          console.error("Error fetching options:", error);
        }
      };
      fetchOptions();
    }
  }, [open, token]);

  // 2. Populate Form on Edit
  useEffect(() => {
    if (open) {
      setConfirmPassword('');
      setIsResettingPassword(false);

      if (userToEdit) {
        // ✅ Safely extract Client ID (check various possible locations)
        const currentClientId =
          userToEdit.clientId ||
          userToEdit.client?.id ||
          userToEdit.organizationId ||
          '';

        // Safely extract Role
        let roleVal = '';
        if (Array.isArray(userToEdit.roles) && userToEdit.roles.length > 0) {
          roleVal = userToEdit.roles[0].name || userToEdit.roles[0];
        } else if (userToEdit.role) {
          roleVal = userToEdit.role;
        }

        setFormData({
          username: userToEdit.username || '',
          email: userToEdit.email || '',
          firstName: userToEdit.firstName || '',
          lastName: userToEdit.lastName || '',
          phoneNumber: userToEdit.phoneNumber || '',
          jobTitle: userToEdit.jobTitle || '',
          password: '',
          isActive: userToEdit.isActive !== false,
          role: roleVal,
          clientId: currentClientId.toString() // ✅ Set clientId
        });
      } else {
        // Reset
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          jobTitle: '',
          password: '',
          isActive: true,
          role: '',
          clientId: '' // ✅ Reset clientId
        });
        setIsResettingPassword(true);
      }
    }
  }, [userToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCreateMode = !userToEdit;
    const shouldValidatePassword = isCreateMode || isResettingPassword;

    if (shouldValidatePassword) {
      if (!formData.password) {
        toast({ variant: "destructive", title: "Error", description: "Password is required" });
        return;
      }
      if (formData.password !== confirmPassword) {
        toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
        return;
      }
    }
    if (!formData.role) {
      toast({ variant: "destructive", title: "Error", description: "Role is required" });
      return;
    }

    setLoading(true);
    try {
      // ✅ Construct Clean Payload with 'clientId'
      const payload: UserDTO = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        jobTitle: formData.jobTitle,
        isActive: formData.isActive,
        role: formData.role,

        // ✅ Send 'clientId'
        clientId: formData.clientId ? Number(formData.clientId) : undefined
      };

      if (shouldValidatePassword) {
        payload.password = formData.password;
      }

      if (userToEdit?.id) {
        payload.id = userToEdit.id;
      }

      console.log("Submitting Payload:", payload);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userToEdit ? <Edit className="w-5 h-5 text-orange-600" /> : <UserPlus className="w-5 h-5 text-green-600" />}
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

          {/* Username & Job Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
              <Input
                required
                disabled={!!userToEdit?.id}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'المسمى الوظيفي' : 'Job Title'}</Label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g. Senior Consultant"
              />
            </div>
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

          {/* Role & Client (Organization) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'الدور الوظيفي' : 'Role'}</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
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
              <Select
                // ✅ Use clientId state
                value={formData.clientId}
                onValueChange={(val) => setFormData({ ...formData, clientId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المؤسسة' : 'Select Organization'} />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {(isResettingPassword || !userToEdit) && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                  <Input
                    type="password"
                    required
                    value={formData.password}
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