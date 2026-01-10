import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateUpdateUserRequest, ApiUser } from '@/services/userService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: ApiUser | null;
  onSubmit: (data: CreateUpdateUserRequest) => Promise<void>;
}

export function UserFormDialog({ open, onOpenChange, userToEdit, onSubmit }: UserFormDialogProps) {
  const { dir } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');

  const [formData, setFormData] = useState<CreateUpdateUserRequest>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '', // Maps to Organization
    jobTitle: '',   // Added Job Title
    password: '',
    isActive: true
  });

  useEffect(() => {
    if (open) {
      setConfirmPassword('');

      if (userToEdit) {
        setFormData({
          id: userToEdit.id,
          username: userToEdit.username,
          email: userToEdit.email,
          firstName: userToEdit.firstName,
          lastName: userToEdit.lastName,
          phoneNumber: userToEdit.phoneNumber || '',
          department: userToEdit.department || '',
          jobTitle: userToEdit.jobTitle || '', // Load existing Job Title
          password: '',
          isActive: userToEdit.isActive
        } as CreateUpdateUserRequest);
      } else {
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          department: '',
          jobTitle: '', // Reset Job Title
          password: '',
          isActive: true
        } as CreateUpdateUserRequest);
      }
    }
  }, [userToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isCreateMode = !userToEdit;

    // Password Validation
    if (isCreateMode && !formData.password) {
      toast({ variant: "destructive", title: "Error", description: "Password is required for new users" });
      return;
    }

    if (formData.password && formData.password !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={dir}>
        <DialogHeader>
          <DialogTitle>
            {userToEdit
              ? (dir === 'rtl' ? 'تعديل المستخدم' : 'Edit User')
              : (dir === 'rtl' ? 'إضافة مستخدم جديد' : 'Add New User')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">

          {/* Row 1: Names */}
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

          {/* Row 2: Username */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
            <Input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!!userToEdit?.id}
            />
          </div>

          {/* Row 3: Contact Info (Email & Phone) */}
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

          {/* Row 4: Professional Info (Job Title & Organization) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'المسمى الوظيفي' : 'Job Title'}</Label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'المنظمة/القسم' : 'Organization/Dept'}</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          {/* Row 5: Password Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-2">
              <Label>
                {dir === 'rtl' ? 'كلمة المرور' : 'Password'}
                {userToEdit && <span className="text-xs text-gray-500 font-normal"> (Optional)</span>}
              </Label>
              <Input
                type="password"
                required={!userToEdit}
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={userToEdit ? (dir === 'rtl' ? 'اتركه فارغاً للإبقاء' : 'Leave empty to keep') : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
              <Input
                type="password"
                required={!userToEdit || !!formData.password}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
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