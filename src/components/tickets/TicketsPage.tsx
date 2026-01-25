import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus,
  Search,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  User,
  Building2,
  ArrowRight,
  RefreshCw,
  Trash2,
  MoreVertical,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('accessToken');

// --- 1. Updated Interfaces to match JSON ---

interface TicketResponseAuthor {
  name: string;
  role: string;
  avatar: string;
}

interface TicketComment {
  id: string;
  author: TicketResponseAuthor; // Nested object in JSON
  message: string;              // 'message' instead of 'comment'
  timestamp: string;            // 'timestamp' instead of 'createdAt'
}

interface TicketProject {
  id: string;
  name: string;
  nameEn: string;
}

interface TicketUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Ticket {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  // API returns lowercase, we allow string to be safe
  status: string;
  priority: string;
  category: string;

  project?: TicketProject;

  // API returns flat fields for creator
  createdById: number;
  createdByName: string;

  assignedTo?: TicketUser;

  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  responses?: TicketComment[];
  attachments?: string[];
  tags?: string[];
}

export function TicketsPage() {
  const { user, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const ticketsList = Array.isArray(data) ? data : (data.data || []);
        setTickets(ticketsList);

        if (selectedTicket) {
          const updatedSelected = ticketsList.find((t: Ticket) => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذه التذكرة؟' : 'Are you sure you want to delete this ticket?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({ title: dir === 'rtl' ? 'تم الحذف بنجاح' : 'Ticket deleted successfully', variant: 'default' });
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      } else {
        toast({ title: dir === 'rtl' ? 'فشل الحذف' : 'Failed to delete ticket', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      // Backend expects lowercase usually if it sends lowercase, 
      // or uppercase if it's an Enum. Let's send what the UI selects (Uppercase) 
      // or convert based on your backend needs.
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PATCH', // Changed from PATCH
        // const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        //   method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({ title: dir === 'rtl' ? 'تم تحديث الحالة' : 'Status updated successfully', variant: 'default' });
        await fetchTickets();
      } else {
        toast({ title: dir === 'rtl' ? 'فشل التحديث' : 'Failed to update status', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;

    const commentPayload = {
      // ✅ FIX: Change 'message' back to 'comment' to match Backend DTO
      comment: newResponse,
      userId: user.id,
      role: user.role,
      avatar: 'U',
      isInternal: true,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentPayload)
      });

      if (response.ok) {
        setNewResponse('');
        fetchTickets();
      } else {
        console.error("Failed to post comment");
        toast({ variant: "destructive", title: "Error", description: "Failed to post comment" });
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };


  // --- Filtering ---
  const getFilteredTickets = () => {
    let filtered = tickets;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(lowerTerm) ||
        ticket.description?.toLowerCase().includes(lowerTerm) ||
        ticket.id.toString().includes(lowerTerm)
      );
    }

    if (statusFilter !== 'all') {
      // Compare lowercase to lowercase to be safe
      filtered = filtered.filter(ticket => ticket.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    // API returns lowercase (e.g., 'open'), map keys need to handle that
    const normalizedStatus = status ? status.toUpperCase() : 'OPEN';

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      OPEN: { label: t('tickets.open'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
      IN_PROGRESS: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      WAITING_RESPONSE: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      RESOLVED: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      CLOSED: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    };

    const config = statusConfig[normalizedStatus] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority = priority ? priority.toUpperCase() : 'MEDIUM';

    const priorityConfig: Record<string, { label: string; color: string }> = {
      LOW: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      MEDIUM: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      HIGH: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      URGENT: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[normalizedPriority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const stats = {
    total: filteredTickets.length,
    open: filteredTickets.filter(t => t.status.toLowerCase() === 'open').length,
    inProgress: filteredTickets.filter(t => t.status.toLowerCase() === 'in_progress').length,
    resolved: filteredTickets.filter(t => t.status.toLowerCase() === 'resolved').length,
    urgent: filteredTickets.filter(t => t.priority.toLowerCase() === 'urgent').length,
  };

  // --- View: Single Ticket Detail ---
  if (selectedTicket) {
    return (
      <div className="space-y-6 p-6" dir={dir}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              <ArrowRight className="w-4 h-4" />
              {dir === 'rtl' ? 'العودة للقائمة' : 'Back to List'}
            </Button>
            <div>
              {/* Using titleEn or title based on language or JSON data */}
              <h1 className="text-2xl font-bold text-gray-900">{dir === 'rtl' ? (selectedTicket.title || selectedTicket.titleEn) : selectedTicket.titleEn}</h1>
              <p className="text-gray-600">#{selectedTicket.id.substring(0, 8)} - {selectedTicket.category || 'General'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasPermission('tickets.edit') ? (
              <Select
                disabled={isUpdating}
                // Ensure value matches one of the SelectItem values (uppercase)
                value={selectedTicket.status.toUpperCase()}
                onValueChange={(val) => handleStatusChange(selectedTicket.id, val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">{t('tickets.open')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('tickets.inProgress')}</SelectItem>
                  <SelectItem value="WAITING_RESPONSE">{t('tickets.waitingResponse')}</SelectItem>
                  <SelectItem value="RESOLVED">{t('tickets.resolved')}</SelectItem>
                  <SelectItem value="CLOSED">{t('tickets.closed')}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              getStatusBadge(selectedTicket.status)
            )}

            {hasPermission('tickets.delete') && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                disabled={isUpdating}
                title={dir === 'rtl' ? 'حذف' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle></CardHeader>
              <CardContent>
                {/* Use descriptionEn or description */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {dir === 'rtl' ? selectedTicket.description : selectedTicket.descriptionEn}
                </p>
                {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTicket.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
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
                {selectedTicket.responses?.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                        {comment.author.avatar || (comment.author.name ? comment.author.name.substring(0, 2).toUpperCase() : 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* 2. Updated accessors for nested author object */}
                        <span className="font-medium text-sm">{comment.author.name || 'Unknown'}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{comment.author.role}</Badge>
                        {/* 3. Updated accessor for timestamp */}
                        <span className="text-xs text-gray-500 ml-auto">{formatDate(comment.timestamp)}</span>
                      </div>
                      {/* 4. Updated accessor for message */}
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.message}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-6">
                  <div className="space-y-3">
                    <Textarea
                      placeholder={dir === 'rtl' ? 'اكتب ردك هنا...' : 'Write your response here...'}
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-end">
                      <Button onClick={handleSendResponse} disabled={!newResponse.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {dir === 'rtl' ? 'إرسال الرد' : 'Send Response'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'معلومات التذكرة' : 'Ticket Information'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    {/* 5. Updated accessor for flat createdByName */}
                    <p className="text-sm font-medium">{selectedTicket.createdByName || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'مقدم الطلب' : 'Requester'}</p>
                  </div>
                </div>

                {/* 6. Updated accessor for Project Name */}
                {selectedTicket.project && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {dir === 'rtl' ? (selectedTicket.project.name || selectedTicket.project.nameEn) : selectedTicket.project.nameEn}
                      </p>
                      <p className="text-xs text-gray-600">{dir === 'rtl' ? 'المشروع' : 'Project'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(selectedTicket.createdAt)}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'تاريخ الإنشاء' : 'Created Date'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- View: Tickets List ---
  return (
    <div className="space-y-6 p-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('tickets.title')}</h1>
          <p className="text-gray-600 mt-1">{t('tickets.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {hasPermission('tickets.create') && (
            <Button onClick={() => setShowCreateTicketModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('tickets.newTicket')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي التذاكر' : 'Total Tickets'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            <p className="text-sm text-gray-600">{t('tickets.open')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-sm text-gray-600">{t('tickets.inProgress')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-gray-600">{t('tickets.resolved')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            <p className="text-sm text-gray-600">{t('tickets.urgent')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
              <Input
                placeholder={t('tickets.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'تصفية بالحالة' : 'Filter by Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="OPEN">{t('tickets.open')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('tickets.inProgress')}</SelectItem>
                  <SelectItem value="WAITING_RESPONSE">{t('tickets.waitingResponse')}</SelectItem>
                  <SelectItem value="RESOLVED">{t('tickets.resolved')}</SelectItem>
                  <SelectItem value="CLOSED">{t('tickets.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tickets.filterPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tickets.allPriorities')}</SelectItem>
                  <SelectItem value="LOW">{t('tickets.low')}</SelectItem>
                  <SelectItem value="MEDIUM">{t('tickets.medium')}</SelectItem>
                  <SelectItem value="HIGH">{t('tickets.high')}</SelectItem>
                  <SelectItem value="URGENT">{t('tickets.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">{dir === 'rtl' ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{dir === 'rtl' ? 'لا توجد تذاكر' : 'No Tickets Found'}</h3>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 relative">

                {hasPermission('tickets.delete') && (
                  <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTicket(ticket.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-10 h-10">
                      {/* 7. Updated fallback logic for flat createdByName */}
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {ticket.createdByName ? ticket.createdByName.substring(0, 2).toUpperCase() : 'TK'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{dir === 'rtl' ? (ticket.title || ticket.titleEn) : ticket.titleEn}</h3>
                          <p className="text-sm text-gray-600">#{ticket.id.substring(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-2 mr-8">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {dir === 'rtl' ? ticket.description : ticket.descriptionEn}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {ticket.project && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{dir === 'rtl' ? (ticket.project.name || ticket.project.nameEn) : ticket.project.nameEn}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTicketModal
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onSubmit={() => {
          setShowCreateTicketModal(false);
          fetchTickets();
        }}
      />
    </div>
  );
}