import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Mail, Phone, Building2, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiUser } from '@/services/userService';
import { Badge } from '@/components/ui/badge';

interface ViewUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: ApiUser | null;
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
    const { dir } = useLanguage();

    if (!user) return null;

    // Helper to safely get role
    const roleName = user.roles && user.roles.length > 0
        ? user.roles[0].replace(/_/g, ' ')
        : 'N/A';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" dir={dir}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Eye className="w-5 h-5 text-blue-600" />
                        {dir === 'rtl' ? 'تفاصيل المستخدم' : 'User Details'}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* Header Section with Name & Role */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-white">
                                    {roleName}
                                </Badge>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.isActive ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-6">

                        <div className="space-y-1">
                            <Label className="text-gray-500 text-xs uppercase tracking-wider">
                                {dir === 'rtl' ? 'اسم المستخدم' : 'Username'}
                            </Label>
                            <div className="flex items-center gap-2 font-medium">
                                <User className="w-4 h-4 text-gray-400" />
                                {user.username}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-gray-500 text-xs uppercase tracking-wider">
                                {dir === 'rtl' ? 'المؤسسة' : 'Organization'}
                            </Label>
                            <div className="flex items-center gap-2 font-medium">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {user.department || 'N/A'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-gray-500 text-xs uppercase tracking-wider">
                                {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                            </Label>
                            <div className="flex items-center gap-2 font-medium">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {user.email}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-gray-500 text-xs uppercase tracking-wider">
                                {dir === 'rtl' ? 'رقم الهاتف' : 'Phone'}
                            </Label>
                            <div className="flex items-center gap-2 font-medium">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {user.phoneNumber || 'N/A'}
                            </div>
                        </div>

                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {dir === 'rtl' ? 'إغلاق' : 'Close'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}