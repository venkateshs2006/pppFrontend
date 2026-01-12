import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUpdateClientRequest, ApiClient } from '@/services/clientService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Link as LinkIcon } from 'lucide-react';

interface OrganizationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgToEdit?: ApiClient | null;
    onSubmit: (data: CreateUpdateClientRequest) => Promise<void>;
}

export function OrganizationFormDialog({ open, onOpenChange, orgToEdit, onSubmit }: OrganizationFormDialogProps) {
    const { dir } = useLanguage();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreateUpdateClientRequest>({
        name: '',
        description: '',
        logoUrl: '',
        contactPersonName: '',
        contactEmail: '',
        subscriptionPlan: 'BASIC',
        subscriptionStatus: 'ACTIVE'
    });

    useEffect(() => {
        // Reset form whenever the dialog opens or the organization to edit changes
        if (open) {
            if (orgToEdit) {
                // Edit Mode: Load existing data
                setFormData({
                    id: orgToEdit.id,
                    name: orgToEdit.name,
                    logoUrl: orgToEdit.logoUrl || '',
                    description: orgToEdit.description || '',
                    contactPersonName: orgToEdit.contactPersonName || '',
                    contactEmail: orgToEdit.contactEmail || '',
                    subscriptionPlan: orgToEdit.subscriptionPlan || 'BASIC',
                    subscriptionStatus: orgToEdit.subscriptionStatus || 'ACTIVE'
                });
            } else {
                // Create Mode: Reset to empty defaults
                setFormData({
                    name: '',
                    description: '',
                    logoUrl: '',
                    contactPersonName: '',
                    contactEmail: '',
                    subscriptionPlan: 'BASIC',
                    subscriptionStatus: 'ACTIVE'
                });
            }
        }
    }, [open, orgToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
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
                        {orgToEdit
                            ? (dir === 'rtl' ? 'تعديل المنظمة' : 'Edit Organization')
                            : (dir === 'rtl' ? 'إضافة منظمة جديدة' : 'Add New Organization')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'اسم المنظمة' : 'Organization Name'}</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'رابط الشعار' : 'Logo URL'}</Label>
                            <div className="relative">
                                <LinkIcon className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                                <Input
                                    className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'اسم جهة الاتصال' : 'Contact Person'}</Label>
                            <Input
                                value={formData.contactPersonName}
                                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Contact Email'}</Label>
                            <Input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'الخطة' : 'Plan'}</Label>
                            <Select
                                value={formData.subscriptionPlan}
                                onValueChange={(val) => setFormData({ ...formData, subscriptionPlan: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BASIC">Basic</SelectItem>
                                    <SelectItem value="PREMIUM">Premium</SelectItem>
                                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{dir === 'rtl' ? 'الحالة' : 'Status'}</Label>
                            <Select
                                value={formData.subscriptionStatus}
                                onValueChange={(val) => setFormData({ ...formData, subscriptionStatus: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{dir === 'rtl' ? 'الوصف' : 'Description'}</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {dir === 'rtl' ? 'حفظ' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}