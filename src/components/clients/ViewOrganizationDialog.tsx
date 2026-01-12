import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, User, Calendar, CreditCard } from 'lucide-react';
import { ApiClient } from '@/services/clientService';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewOrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    org: ApiClient | null;
}

export function ViewOrganizationDialog({ open, onOpenChange, org }: ViewOrganizationDialogProps) {
    const { dir } = useLanguage();

    if (!org) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" dir={dir}>
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        {org.logoUrl ? (
                            <img src={org.logoUrl} alt="logo" className="w-12 h-12 rounded object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-bold text-xl">
                                {org.name[0]}
                            </div>
                        )}
                        <div>
                            <DialogTitle className="text-xl">{org.name}</DialogTitle>
                            <p className="text-sm text-gray-500">{org.subscriptionPlan} Plan</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Description */}
                    {org.description && (
                        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                            {org.description}
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" /> Contact Person</Label>
                            <p className="font-medium text-sm">{org.contactPersonName || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                            <p className="font-medium text-sm">{org.contactEmail || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Stats / Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Status</Label>
                            <div>
                                <Badge variant={org.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {org.subscriptionStatus}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Projects</Label>
                            <div className="flex gap-3 text-sm">
                                <span>Total: <b>{org.projectsCount || 0}</b></span>
                                <span>Active: <b>{org.activeProjectsCount || 0}</b></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}