import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus, Search, MessageSquare, AlertCircle, CheckCircle2, Clock,
  MoreHorizontal, Eye, Edit, Send, Paperclip, Calendar, User,
  Building2, Tag, ArrowRight, Reply, XCircle, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { TicketDTO, TicketCommentDTO } from '@/types/api';
import { parseJwt } from '@/lib/utils';
export function TicketsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  // Data State
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [ticketComments, setTicketComments] = useState<TicketCommentDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newResponse, setNewResponse] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // --- API INTEGRATION START ---

  // 1. Fetch All Tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const decoded = parseJwt(token);
      const userId = decoded?.userId;

      if (!userId) {
        console.error("User ID not found in token");
        return;
      }

      const data = await api.tickets.getByUser(userId);
      // Note: Backend needs to return full objects or you need to map IDs to names here
      setTickets(data || []);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load tickets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Fetch Comments when Ticket Selected
  useEffect(() => {
    if (selectedTicket) {
      const loadComments = async () => {
        try {
          const comments = await api.tickets.getComments(selectedTicket);
          setTicketComments(comments);
        } catch (error) {
          console.error("Failed to load comments", error);
        }
      };
      loadComments();
    }
  }, [selectedTicket]);

  // 3. Create Ticket
  const handleCreateTicket = async (ticketData: any) => {
    try {
      const payload = {
        ...ticketData,
        createdBy: Number(userProfile?.id),
        status: 'open'
      };
      const newTicket = await api.tickets.create(payload);
      setTickets([newTicket, ...tickets]);
      setShowCreateTicketModal(false);
      toast({ title: t('common.success'), description: "Ticket created successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create ticket" });
    }
  };

  // 4. Add Comment
  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;
    try {
      const commentData = {
        comment: newResponse,
        userId: Number(userProfile?.id),
        isInternal: false
      };
      const addedComment = await api.tickets.addComment(selectedTicket, commentData);
      setTicketComments([...ticketComments, addedComment]);
      setNewResponse('');
      toast({ title: "Success", description: "Comment added" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send comment" });
    }
  };

  // 5. Workflow Actions
  const updateLocalTicket = (updatedTicket: TicketDTO) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
  };

  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'reject' | 'assign', param?: any) => {
    if (!selectedTicket) return;
    const userId = Number(userProfile?.id);

    try {
      let updated: TicketDTO;
      switch (action) {
        case 'submit':
          updated = await api.tickets.submitForApproval(selectedTicket);
          toast({ title: "Submitted", description: "Ticket sent for approval" });
          break;
        case 'approve':
          updated = await api.tickets.approve(selectedTicket, userId); // Assuming userId is clientId here
          toast({ title: "Approved", description: "Ticket closed successfully" });
          break;
        case 'reject':
          updated = await api.tickets.reject(selectedTicket, userId);
          toast({ title: "Rejected", description: "Ticket returned for rework" });
          break;
        case 'assign':
          // param is newAssigneeId
          updated = await api.tickets.assign(selectedTicket, param, userId);
          setIsAssigning(false);
          toast({ title: "Assigned", description: "Ticket reassigned" });
          break;
        default:
          return;
      }
      updateLocalTicket(updated);
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not complete request" });
    }
  };

  // 6. File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTicket || !e.target.files?.[0]) return;
    try {
      const file = e.target.files[0];
      await api.tickets.uploadAttachment(selectedTicket, file, Number(userProfile?.id));
      toast({ title: "Uploaded", description: "File attached successfully" });
      // Ideally refresh ticket details here to show new attachment
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload file" });
    }
  };

  // --- UI RENDERING LOGIC ---

  const selectedTicketData = selectedTicket ? tickets.find(t => t.id === selectedTicket) : null;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
      open: { label: t('tickets.open'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
      in_progress: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      waiting_response: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      pending_client_approval: { label: 'Pending Approval', color: 'bg-purple-100 text-purple-800', icon: Clock },
      resolved: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      closed: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
      redo: { label: 'Redo', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- RENDER DETAILS VIEW ---
  if (selectedTicket && selectedTicketData) {
    return (
      <div className="space-y-6 p-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              <ArrowRight className="w-4 h-4" />
              {dir === 'rtl' ? 'العودة للقائمة' : 'Back to List'}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTicketData.title}</h1>
              <p className="text-gray-600">#{selectedTicketData.id} - {selectedTicketData.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTicketData.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{selectedTicketData.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {dir === 'rtl' ? 'المحادثة' : 'Conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">User #{comment.userId}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                ))}

                {hasPermission('tickets.respond') && (
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <Textarea
                      placeholder={dir === 'rtl' ? 'اكتب ردك هنا...' : 'Write response...'}
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                          <Paperclip className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'إرفاق ملف' : 'Attach File'}
                        </Button>
                      </div>
                      <Button onClick={handleSendResponse} disabled={!newResponse.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {dir === 'rtl' ? 'إرسال' : 'Send'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {/* 1. Submit for Approval */}
                {(selectedTicketData.status === 'in_progress' || selectedTicketData.status === 'redo') && (
                  <Button onClick={() => handleWorkflowAction('submit')} className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {dir === 'rtl' ? 'إرسال للموافقة' : 'Submit for Approval'}
                  </Button>
                )}

                {/* 2. Approve/Reject */}
                {selectedTicketData.status === 'pending_client_approval' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleWorkflowAction('approve')} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleWorkflowAction('reject')} variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {/* 3. Reassign */}
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsAssigning(!isAssigning)}>
                  <User className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'إعادة تعيين' : 'Reassign'}
                </Button>

                {isAssigning && (
                  <div className="p-2 border rounded bg-gray-50 mt-2">
                    <p className="text-xs mb-2">Enter User ID:</p>
                    <Input
                      placeholder="User ID"
                      type="number"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleWorkflowAction('assign', Number(e.currentTarget.value));
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER LIST VIEW ---
  return (
    <div className="space-y-6 p-6" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('tickets.title')}</h1>
        <Button onClick={() => setShowCreateTicketModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('tickets.newTicket')}
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder={t('tickets.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tickets found</div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedTicket(ticket.id)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <p className="text-sm text-gray-500">#{ticket.id} - {ticket.project?.name}</p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{ticket.description}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {ticket.assignedTo && <span className="flex items-center gap-1"><User className="w-4 h-4" /> Assignee ID: {ticket.assignedTo}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTicketModal
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}