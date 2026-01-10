import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateUserDTO } from '@/services/UserService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDTO) => Promise<void>;
}

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const { dir } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state with empty values matching your DTO structure
  // Note: We only initialize the fields that are entered in the form.
  // Backend should handle createdAt, lastLoginAt, isActive, etc.
  const [formData, setFormData] = useState<Partial<CreateUserDTO>>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    jobTitle: '',
    organization: '',
    password: '',
    isActive: true, // Default to active
    roles: null,
    avatarUrl: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Construct fullName before sending if required by DTO
      const submissionData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        createdAt: new Date().toISOString(), // Fallback if backend requires it in payload
        lastLoginAt: null
      } as CreateUserDTO;

      await onSubmit(submissionData);

      // Reset form
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        jobTitle: '',
        organization: '',
        password: '',
        isActive: true
      });
      onClose();
    } catch (error) {
      console.error(error);
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

          {/* Username (New Field) */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
            <Input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. jdoe_consultant"
            />
          </div>

          {/* Name Fields Row */}
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

          {/* Phone Number */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</Label>
            <Input
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Organization (New Field) */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'المؤسسة' : 'Organization'}</Label>
            <Input
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="e.g. PPP Consulting"
            />
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'المسمى الوظيفي' : 'Job Title'}</Label>
            <Select
              value={formData.jobTitle || ''}
              onValueChange={(val) => setFormData({ ...formData, jobTitle: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder={dir === 'rtl' ? 'اختر المسمى الوظيفي' : 'Select Job Title'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Senior Consultant">Lead Consultant (Senior)</SelectItem>
                <SelectItem value="Specialist">Sub Consultant (Specialist)</SelectItem>
                <SelectItem value="IT Director">Main Client (Director)</SelectItem>
                <SelectItem value="Analyst">Analyst</SelectItem>
                <SelectItem value="System Owner">System Owner</SelectItem>
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