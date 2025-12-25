import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, UserPlus, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSave: (members: any[]) => void;
}

export function ManageTeamModal({ isOpen, onClose, project, onSave }: ManageTeamModalProps) {
  const { language, dir } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('CONSULTANT'); // Default to upper case for enum
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch Members
  const fetchMembers = async () => {
    if (!project?.id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/projects/${project.id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل تحميل الأعضاء' : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, project]);

  const handleAddMember = async () => {
    if (!newUserEmail) return;
    setAdding(true);

    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // STEP 1: Find User by Email
      const userSearchResponse = await fetch(`http://localhost:8080/api/users/search?email=${newUserEmail}`, {
        method: 'GET',
        headers: headers
      });

      if (!userSearchResponse.ok) {
        if (userSearchResponse.status === 404) {
          throw new Error(language === 'ar' ? 'المستخدم غير موجود' : 'User not found');
        }
        throw new Error('Failed to find user');
      }

      const userData = await userSearchResponse.json();
      const userId = userData.id;

      // STEP 2: Add Member using the found User ID
      const payload = {
        userId: userId,
        projectId: project.id,
        role: newUserRole,
      };

      const addResponse = await fetch(`http://localhost:8080/api/projects/${project.id}/members`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!addResponse.ok) {
        const err = await addResponse.json();
        throw new Error(err.message || 'Failed to add member');
      }

      toast.success(language === 'ar' ? 'تم إضافة العضو بنجاح' : 'Member added successfully');
      setNewUserEmail('');
      fetchMembers(); // Refresh list
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (language === 'ar' ? 'فشل إضافة العضو' : 'Failed to add member'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/projects/${project.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to remove');

      toast.success(language === 'ar' ? 'تم حذف العضو' : 'Member removed');
      setMembers(members.filter(m => m.id !== memberId));
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to remove');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir={dir}>
        <DialogHeader>
          <DialogTitle>{language === 'ar' ? 'إدارة فريق المشروع' : 'Manage Project Team'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member Form */}
          <div className="flex gap-2 items-end bg-gray-50 p-4 rounded-lg">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <Input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="w-40 space-y-2">
              <label className="text-sm font-medium">{language === 'ar' ? 'الدور' : 'Role'}</label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTANT">Consultant</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddMember} disabled={adding || !newUserEmail}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </Button>
          </div>

          {/* Members List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : members.length > 0 ? (
              members.map((member, index) => (
                <Card key={member.id || index}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {(member.userName || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.userName || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{member.userEmail || member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{member.role}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                {language === 'ar' ? 'لا يوجد أعضاء' : 'No team members'}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
            <Button onClick={() => onSave(members)} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}