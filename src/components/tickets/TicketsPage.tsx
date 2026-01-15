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
  Tag,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';
const API_BASE_URL = import.meta.env.VITE_API_URL;
// --- Interfaces matching Backend DTOs ---
const token = localStorage.getItem('accessToken');
// Matches public class TicketCommentDTO
interface TicketComment {
  id: string;
  ticketId: string;
  userId: number;
  name: string;     // Author Name
  role: string;     // Author Role
  avatar: string;   // Author Initials/Avatar
  comment: string;  // The actual message content
  isInternal: boolean;
  createdAt: string;
}

// Matches TicketDTO
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'WAITING_RESPONSE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  project?: {
    id: string;
    titleEn: string;
    titleAr: string;
  };
  createdBy?: {
    id: number;
    name: string;
    avatar?: string;
    organization?: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    role?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  // This matches the list of TicketCommentDTOs returned by the API
  responses?: TicketComment[];
  attachments?: string[];
  tags?: string[];
}

export function TicketsPage() {
  const { user, userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // --- API: Fetch Tickets ---
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

        // If a ticket is currently selected, update its data to show new comments/status
        if (selectedTicket) {
          const updatedSelected = ticketsList.find((t: Ticket) => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      } else {
        console.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]); // Add token as dep

  // --- API: Send Comment ---
  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;

    // Construct payload matching TicketCommentDTO
    // Note: ticketId is passed in path, but usually API expects fields like userId in body for Service logic
    const commentPayload = {
      comment: newResponse,
      userId: user.id,
      role: user.role,
      avatar: 'U',// Important: Send current user ID
      isInternal: true,       // Default value
      // ticketId: selectedTicket.id -- Optional if backend relies on PathVariable, but good for completeness if DTO has it
    };
    console.log(commentPayload);
    console.log(userProfile);
    console.log(user);
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
        // Re-fetch tickets to get the updated list with the new comment
        fetchTickets();
      } else {
        console.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  // --- Logic: Filtering ---
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
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      OPEN: { label: t('tickets.open'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
      IN_PROGRESS: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      WAITING_RESPONSE: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      RESOLVED: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      CLOSED: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; color: string }> = {
      LOW: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      MEDIUM: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      HIGH: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      URGENT: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
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
    open: filteredTickets.filter(t => t.status === 'OPEN').length,
    inProgress: filteredTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: filteredTickets.filter(t => t.status === 'RESOLVED').length,
    urgent: filteredTickets.filter(t => t.priority === 'URGENT').length,
  };

  // --- View: Single Ticket Detail ---
  if (selectedTicket) {
    return (
      <div className="space-y-6 p-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              <ArrowRight className="w-4 h-4" />
              {dir === 'rtl' ? 'العودة للقائمة' : 'Back to List'}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.title}</h1>
              <p className="text-gray-600">#{selectedTicket.id.substring(0, 8)} - {selectedTicket.category || 'General'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedTicket.status)}
            {getPriorityBadge(selectedTicket.priority)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTicket.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {dir === 'rtl' ? 'المحادثة' : 'Conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List Comments */}
                {selectedTicket.responses.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">
                        {comment.author.avatar || (comment.author.name ? comment.author.name.substring(0, 2).toUpperCase() : 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name || 'Unknown User'}</span>
                        {comment.author.role && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {comment.author.role}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add Comment Input */}
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

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{dir === 'rtl' ? 'معلومات التذكرة' : 'Ticket Information'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{selectedTicket.createdBy?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'مقدم الطلب' : 'Requester'}</p>
                  </div>
                </div>

                {selectedTicket.project && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{dir === 'rtl' ? selectedTicket.project.titleAr : selectedTicket.project.titleEn}</p>
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

      {/* List */}
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
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">{ticket.createdBy?.name?.substring(0, 2) || 'TK'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.title}</h3>
                          <p className="text-sm text-gray-600">#{ticket.id.substring(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {ticket.project && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{dir === 'rtl' ? ticket.project.titleAr : ticket.project.titleEn}</span>
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