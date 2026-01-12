import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { deliverableService, Deliverable } from '@/services/deliverableService';
import { Loader2, File as FileIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    deliverable?: Deliverable | null;
    onSuccess: () => void;
}

export function DeliverableFormDialog({ open, onOpenChange, projectId, deliverable, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Default State
    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        description: '',
        type: 'policy', // Lowercase default
        status: 'draft' // Lowercase default
    });

    useEffect(() => {
        if (open) {
            if (deliverable) {
                setFormData({
                    title: deliverable.title,
                    titleEn: deliverable.titleEn,
                    description: deliverable.description || '',
                    // Ensure values are lowercase for the Select component
                    type: deliverable.type.toLowerCase(),
                    status: deliverable.status.toLowerCase()
                });
            } else {
                setFormData({
                    title: '',
                    titleEn: '',
                    description: '',
                    type: 'policy',
                    status: 'draft'
                });
            }
            setFile(null);
        }
    }, [open, deliverable]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let savedId = deliverable?.id;

            // Prepare payload (convert type/status to UpperCase if your Backend requires it, 
            // OR keep lowercase if you updated your Java Enums with @JsonCreator)
            const payload = {
                ...formData,
                projectId,
                type: formData.type.toUpperCase(), // Sending Uppercase to be safe
                status: formData.status.toUpperCase()
            };

            if (deliverable) {
                await deliverableService.update(deliverable.id, payload);
                toast({ title: "Updated successfully" });
            } else {
                const res = await deliverableService.create({ ...payload, version: '1.0' });
                savedId = res.id;
                toast({ title: "Created successfully" });
            }

            // Handle File Upload if a file was selected
            if (file && savedId) {
                await deliverableService.uploadFile(savedId, file);
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Operation failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{deliverable ? 'Edit Deliverable' : 'Add New Deliverable'}</DialogTitle>
                </DialogHeader>

                {/* FORM START */}
                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title (Arabic)</Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Title (English)</Label>
                            <Input
                                value={formData.titleEn}
                                onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={v => setFormData({ ...formData, type: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="policy">Policy</SelectItem>
                                    <SelectItem value="procedure">Procedure</SelectItem>
                                    <SelectItem value="guide">Guide</SelectItem>
                                    <SelectItem value="template">Template</SelectItem>
                                    <SelectItem value="topic">Topic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={v => setFormData({ ...formData, status: v })}
                                disabled={!deliverable}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                        <Label>Attachment</Label>
                        {deliverable?.fileName && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                                <FileIcon className="w-4 h-4" />
                                <a href={deliverable.fileUrl} target="_blank" rel="noreferrer" className="underline">
                                    {deliverable.fileName}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Saving...' : 'Save Deliverable'}
                        </Button>
                    </DialogFooter>

                </form>
                {/* FORM END - Ensure this tag exists! */}

            </DialogContent>
        </Dialog>
    );
}