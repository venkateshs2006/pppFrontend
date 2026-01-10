import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus, Search, MessageSquare, AlertCircle, CheckCircle2, Clock, MoreHorizontal,
  Eye, Edit, Send, Paperclip, Calendar, User, Building2, Tag, ArrowRight, Reply,
  Loader2, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';
import { toast } from 'sonner';

// --- Types ---
interface Ticket {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  categoryEn: string;
  project: {
    id: string;
    name: string;
    nameEn: string;
  };
  client: {
    name: string;
    nameEn: string;
    organization: string;
    organizationEn: string;
    avatar: string;
  };
  assignedTo?: {
    id?: string; // Added ID for assignment logic
    name: string;
    role: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  responses: Array<{
    id: string;
    author: {
      name: string;
      role: string;
      avatar: string;
    };
    message: string;
    messageEn: string;
    timestamp: string;
    attachments?: string[];
  }>;
  attachments: string[];
  tags: string[];
  tagsEn: string[];
}

// --- API Service (Mocking the endpoint structure) ---
const API_BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('accessToken');
export function TicketsPage() {
  const { userProfile, hasPermission } = useAuth(); // Assuming token is available in context
  const { t, dir } = useLanguage();

  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Detail View State
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // --- 1. Fetch Tickets ---
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Build Query Params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      // Backend should handle role-based filtering (Admin vs User) via Token

      const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]); // Re-fetch when filters change (optional, or filter client-side)

  // --- 2. Create Ticket ---
  const handleCreateTicket = async (ticketData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });

      if (response.ok) {
        toast.success(dir === 'rtl' ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully');
        setShowCreateTicketModal(false);
        fetchTickets(); // Refresh list
      } else {
        throw new Error('Creation failed');
      }
    } catch (error) {
      toast.error(dir === 'rtl' ? 'فشل إنشاء التذكرة' : 'Failed to create ticket');
    }
  };

  // --- 3. Upload File Attachment ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.fileUrl; // Assuming backend returns { fileUrl: "..." }
      }
      return null;
    } catch (error) {
      console.error("Upload error", error);
      return null;
    }
  };

  // --- 4. Send Comment / Response ---
  const handleSendResponse = async () => {
    if (!newResponse.trim() && !selectedFile) return;
    if (!selectedTicket) return;

    setIsSubmitting(true);
    try {
      let attachmentUrl = null;

      // A. Upload File first if exists
      if (selectedFile) {
        attachmentUrl = await uploadFile(selectedFile);
        if (!attachmentUrl) {
          toast.error("File upload failed");
          setIsSubmitting(false);
          return;
        }
      }

      // B. Post Comment
      const payload = {
        ticketId: selectedTicket,
        userId: userProfile.id,
        comment: newResponse,
        attachments: attachmentUrl ? [attachmentUrl] : []
      };

      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedTicket = await response.json();

        // Update local state
        setTickets(prev => prev.map(t => t.id === selectedTicket ? updatedTicket : t));
        setNewResponse('');
        setSelectedFile(null);
        toast.success(dir === 'rtl' ? 'تم إرسال الرد' : 'Response sent');
      } else {
        toast.error("Failed to send response");
      }
    } catch (error) {
      toast.error("Error sending response");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. Assign Ticket ---
  const handleAssignTicket = async (ticketId: string) => {
    // In a real app, this would open a modal to select a user.
    // Here we assume "Assign to Me" or a hardcoded user for demo.
    const assigneeId = userProfile.id;

    if (!assigneeId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign/${assigneeId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(dir === 'rtl' ? 'تم تعيين التذكرة' : 'Ticket assigned successfully');
        fetchTickets(); // Refresh
      }
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  // --- Helpers ---
  const getFilteredTickets = () => {
    // Client-side filtering for Search (Backend handles status/priority/role usually)
    let filtered = tickets;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        (ticket.title || '').toLowerCase().includes(lowerTerm) ||
        (ticket.description || '').toLowerCase().includes(lowerTerm) ||
        (ticket.titleEn || '').toLowerCase().includes(lowerTerm)
      );
    }
    // Also apply client side filters if the API didn't handle them
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);

    return filtered;
  };

  const filteredTickets = getFilteredTickets();
  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  // Stats Calculation
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    overdue: tickets.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  // --- UI Helpers (Badges, Dates) ---
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      open: { label: t('tickets.open'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
      in_progress: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      waiting_response: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      resolved: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      closed: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100', icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: any = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };
    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100' };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- RENDER ---
  if (loading && tickets.length === 0) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  // DETAILED VIEW
  if (selectedTicket && selectedTicketData) {
    return (
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              <ArrowRight className="w-4 h-4" />
              {dir === 'rtl' ? 'العودة للقائمة' : 'Back to List'}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dir === 'rtl' ? selectedTicketData.title : selectedTicketData.titleEn}
              </h1>
              <p className="text-gray-600">
                #{selectedTicketData.id} - {dir === 'rtl' ? selectedTicketData.category : selectedTicketData.categoryEn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTicketData.status)}
            {getPriorityBadge(selectedTicketData.priority)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {dir === 'rtl' ? selectedTicketData.description : selectedTicketData.descriptionEn}
                </p>
                {/* Attachments Display */}
                {selectedTicketData.attachments && selectedTicketData.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">{dir === 'rtl' ? 'المرفقات:' : 'Attachments:'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicketData.attachments.map((attachment, index) => (
                        <a key={index} href={attachment} target="_blank" rel="noreferrer">
                          <Badge variant="secondary" className="flex items-center gap-1 hover:bg-slate-200 cursor-pointer">
                            <Paperclip className="w-3 h-3" />
                            {attachment.split('/').pop()} {/* Show filename */}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {dir === 'rtl' ? 'المحادثة' : 'Conversation'} ({selectedTicketData.responses?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTicketData.responses?.map((response) => (
                  <div key={response.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {/* Safely access avatar, fallback to '?' if client is missing */}
                        {selectedTicketData.client?.avatar || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{response.author.name}</span>
                        <Badge variant="outline" className="text-xs">{response.author.role}</Badge>
                        <span className="text-xs text-gray-500">{formatDate(response.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {dir === 'rtl' ? response.message : response.messageEn}
                      </p>
                      {/* Response Attachments */}
                      {response.attachments && response.attachments.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {response.attachments.map((att, i) => (
                            <a key={i} href={att} target="_blank" className="text-xs text-blue-600 flex items-center gap-1">
                              <Paperclip className="w-3 h-3" /> Attachment {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Response */}
                {hasPermission('tickets.respond') && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder={dir === 'rtl' ? 'اكتب ردك هنا...' : 'Write your response here...'}
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        rows={3}
                      />

                      {/* Selected File Preview */}
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          <Paperclip className="w-4 h-4" />
                          {selectedFile.name}
                          <button onClick={() => setSelectedFile(null)}><X className="w-4 h-4 hover:text-red-500" /></button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} type="button">
                          <Paperclip className="w-4 h-4" />
                          {dir === 'rtl' ? 'إرفاق ملف' : 'Attach File'}
                        </Button>
                        <Button onClick={handleSendResponse} disabled={(!newResponse.trim() && !selectedFile) || isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {dir === 'rtl' ? 'إرسال الرد' : 'Send Response'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'معلومات التذكرة' : 'Ticket Information'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{dir === 'rtl' ? selectedTicketData.client.name : selectedTicketData.client.nameEn}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? selectedTicketData.client.organization : selectedTicketData.client.organizationEn}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    {dir === 'rtl' ? selectedTicketData.title : selectedTicketData.titleEn}
                  </h3>

                  {/* 2. Fix the Project Name (Project might also be null) */}
                  <p className="text-sm text-gray-600">
                    #{selectedTicketData.id} - {dir === 'rtl' ? selectedTicketData.project?.name : selectedTicketData.project?.nameEn || 'No Project'}
                  </p>
                </div>
                {selectedTicketData.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">{selectedTicketData.assignedTo.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedTicketData.assignedTo.name}</p>
                      <p className="text-xs text-gray-600">{selectedTicketData.assignedTo.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">Unassigned</div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(selectedTicketData.dueDate)}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'الموعد النهائي' : 'Due Date'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasPermission('tickets.edit') && (
              <Card>
                <CardHeader><CardTitle>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4" />
                    {dir === 'rtl' ? 'تحرير التذكرة' : 'Edit Ticket'}
                  </Button>

                  {/* Assign Ticket Button wired to API */}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssignTicket(selectedTicketData.id)}
                  >
                    <User className="w-4 h-4" />
                    {dir === 'rtl' ? 'تعيين لي' : 'Assign to Me'}
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle2 className="w-4 h-4" />
                    {dir === 'rtl' ? 'تغيير الحالة' : 'Change Status'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW (Main Render)
  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('tickets.title')}</h1>
          <p className="text-gray-600 mt-1">{t('tickets.description')}</p>
        </div>
        {hasPermission('tickets.create') && (
          <Button onClick={() => setShowCreateTicketModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('tickets.newTicket')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* ... (Keep existing stats cards logic, just make sure to use 'stats' variable) ... */}
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-gray-600">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.open}</p><p className="text-sm text-gray-600">Open</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p><p className="text-sm text-gray-600">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.resolved}</p><p className="text-sm text-gray-600">Resolved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{stats.overdue}</p><p className="text-sm text-gray-600">Overdue</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.urgent}</p><p className="text-sm text-gray-600">Urgent</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
              <Input
                placeholder={t('tickets.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket.id)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{ticket.client.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dir === 'rtl' ? ticket.title : ticket.titleEn}</h3>
                        <p className="text-sm text-gray-600">#{ticket.id} - {dir === 'rtl' ? ticket.project.name : ticket.project.nameEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{dir === 'rtl' ? ticket.description : ticket.descriptionEn}</p>
                    {/* Tags */}
                    <div className="flex gap-2">
                      {ticket.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-10 text-gray-500">No tickets found</div>
      )}

      <CreateTicketModal
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}