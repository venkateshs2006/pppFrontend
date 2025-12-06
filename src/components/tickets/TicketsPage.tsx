import { useState } from 'react';
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
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Paperclip,
  Filter,
  Calendar,
  User,
  Building2,
  Tag,
  ArrowRight,
  Reply
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';

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

export function TicketsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // بيانات التذاكر الشاملة
  const allTickets: Ticket[] = [
    {
      id: '1',
      title: 'طلب تعديل سياسة الإجازات لتشمل إجازة الأمومة الممتدة',
      titleEn: 'Request to modify leave policy to include extended maternity leave',
      description: 'نحتاج إلى تعديل سياسة الإجازات الحالية لتتماشى مع التحديثات الجديدة في نظام العمل السعودي، خاصة فيما يتعلق بإجازة الأمومة الممتدة والإجازات الاستثنائية.',
      descriptionEn: 'We need to modify the current leave policy to align with new updates in Saudi labor law, especially regarding extended maternity leave and exceptional leaves.',
      status: 'open',
      priority: 'high',
      category: 'تعديل محتوى',
      categoryEn: 'Content Modification',
      project: {
        id: '1',
        name: 'مشروع الموارد البشرية',
        nameEn: 'HR Project'
      },
      client: {
        name: 'سلطان منصور',
        nameEn: 'Sultan Mansour',
        organization: 'شركة منصور القابضة',
        organizationEn: 'Mansour Holding Company',
        avatar: 'SM'
      },
      assignedTo: {
        name: 'د. فهد السعدي',
        role: 'مدير النظام',
        avatar: 'FS'
      },
      createdAt: '2024-10-28T09:30:00Z',
      updatedAt: '2024-10-30T14:20:00Z',
      dueDate: '2024-11-15T23:59:59Z',
      responses: [
        {
          id: '1',
          author: {
            name: 'د. فهد السعدي',
            role: 'مدير النظام',
            avatar: 'FS'
          },
          message: 'تم استلام طلبكم وسنقوم بمراجعة السياسة الحالية وإعداد التعديلات المطلوبة خلال 3 أيام عمل.',
          messageEn: 'Your request has been received and we will review the current policy and prepare the required modifications within 3 business days.',
          timestamp: '2024-10-28T10:15:00Z',
        },
        {
          id: '2',
          author: {
            name: 'سلطان منصور',
            role: 'عميل',
            avatar: 'SM'
          },
          message: 'شكراً لكم، نرجو التأكد من تضمين الإجازات الجديدة للآباء أيضاً حسب النظام المحدث.',
          messageEn: 'Thank you, please make sure to include the new paternity leaves as well according to the updated system.',
          timestamp: '2024-10-29T08:45:00Z',
        }
      ],
      attachments: ['نظام_العمل_المحدث.pdf', 'متطلبات_الإجازات.docx'],
      tags: ['عاجل', 'نظام العمل', 'إجازات'],
      tagsEn: ['Urgent', 'Labor Law', 'Leaves']
    },
    {
      id: '2',
      title: 'مشكلة في الوصول لملفات مشروع السياسات المالية',
      titleEn: 'Issue accessing financial policies project files',
      description: 'لا يمكنني الوصول إلى ملفات مشروع السياسات المالية في النظام، أحتاج صلاحيات إضافية أو حل للمشكلة التقنية.',
      descriptionEn: 'I cannot access the financial policies project files in the system, I need additional permissions or a solution to the technical issue.',
      status: 'in_progress',
      priority: 'urgent',
      category: 'دعم فني',
      categoryEn: 'Technical Support',
      project: {
        id: '2',
        name: 'مشروع السياسات المالية',
        nameEn: 'Financial Policies Project'
      },
      client: {
        name: 'نورا القحطاني',
        nameEn: 'Nora Al-Qahtani',
        organization: 'مجموعة الاستثمار الخليجي',
        organizationEn: 'Gulf Investment Group',
        avatar: 'NQ'
      },
      assignedTo: {
        name: 'د. عبدالله الراشد',
        role: 'مستشار مالي أول',
        avatar: 'AR'
      },
      createdAt: '2024-10-29T11:20:00Z',
      updatedAt: '2024-10-30T16:30:00Z',
      dueDate: '2024-11-05T23:59:59Z',
      responses: [
        {
          id: '1',
          author: {
            name: 'د. عبدالله الراشد',
            role: 'مستشار مالي أول',
            avatar: 'AR'
          },
          message: 'تم التحقق من المشكلة وهي متعلقة بصلاحيات النظام. سنقوم بتحديث صلاحياتكم خلال ساعة.',
          messageEn: 'The issue has been verified and is related to system permissions. We will update your permissions within an hour.',
          timestamp: '2024-10-29T12:00:00Z',
        }
      ],
      attachments: ['screenshot_error.png'],
      tags: ['تقني', 'صلاحيات', 'عاجل'],
      tagsEn: ['Technical', 'Permissions', 'Urgent']
    },
    {
      id: '3',
      title: 'استفسار حول إجراءات الموافقة على السياسات الجديدة',
      titleEn: 'Inquiry about approval procedures for new policies',
      description: 'ما هي الخطوات المطلوبة للحصول على موافقة مجلس الإدارة على السياسات الجديدة؟ وما هي المدة الزمنية المتوقعة؟',
      descriptionEn: 'What are the required steps to obtain board approval for new policies? And what is the expected timeframe?',
      status: 'waiting_response',
      priority: 'medium',
      category: 'استفسار',
      categoryEn: 'Inquiry',
      project: {
        id: '3',
        name: 'مشروع الحوكمة',
        nameEn: 'Governance Project'
      },
      client: {
        name: 'عبدالرحمن الغامدي',
        nameEn: 'Abdulrahman Al-Ghamdi',
        organization: 'البنك التجاري الوطني',
        organizationEn: 'National Commercial Bank',
        avatar: 'AG'
      },
      assignedTo: {
        name: 'د. منى الحربي',
        role: 'مستشار حوكمة أول',
        avatar: 'MH'
      },
      createdAt: '2024-10-30T14:15:00Z',
      updatedAt: '2024-10-30T14:15:00Z',
      dueDate: '2024-11-10T23:59:59Z',
      responses: [],
      attachments: [],
      tags: ['حوكمة', 'موافقات', 'استفسار'],
      tagsEn: ['Governance', 'Approvals', 'Inquiry']
    },
    {
      id: '4',
      title: 'طلب إضافة قسم جديد لسياسات العمل عن بُعد',
      titleEn: 'Request to add new section for remote work policies',
      description: 'نحتاج لإضافة قسم شامل في دليل الموارد البشرية يغطي سياسات العمل عن بُعد والعمل المرن بما يتماشى مع التوجهات الحديثة.',
      descriptionEn: 'We need to add a comprehensive section in the HR manual covering remote work and flexible work policies in line with modern trends.',
      status: 'resolved',
      priority: 'medium',
      category: 'تعديل محتوى',
      categoryEn: 'Content Modification',
      project: {
        id: '1',
        name: 'مشروع الموارد البشرية',
        nameEn: 'HR Project'
      },
      client: {
        name: 'أحمد المالكي',
        nameEn: 'Ahmed Al-Malki',
        organization: 'شركة التقنية المتقدمة',
        organizationEn: 'Advanced Technology Company',
        avatar: 'AM'
      },
      assignedTo: {
        name: 'محمد العتيبي',
        role: 'مستشار مساعد',
        avatar: 'ME'
      },
      createdAt: '2024-10-25T10:00:00Z',
      updatedAt: '2024-10-30T09:30:00Z',
      dueDate: '2024-10-30T23:59:59Z',
      responses: [
        {
          id: '1',
          author: {
            name: 'محمد العتيبي',
            role: 'مستشار مساعد',
            avatar: 'ME'
          },
          message: 'تم إعداد القسم الجديد وإضافته للدليل. يشمل 5 سياسات أساسية للعمل عن بُعد.',
          messageEn: 'The new section has been prepared and added to the manual. It includes 5 basic remote work policies.',
          timestamp: '2024-10-30T09:30:00Z',
        }
      ],
      attachments: ['سياسات_العمل_عن_بعد.pdf'],
      tags: ['مكتمل', 'عمل عن بعد', 'سياسات'],
      tagsEn: ['Completed', 'Remote Work', 'Policies']
    },
    {
      id: '5',
      title: 'طلب مراجعة عاجلة لسياسة الأمان السيبراني',
      titleEn: 'Urgent review request for cybersecurity policy',
      description: 'بعد الحادث الأمني الأخير، نحتاج مراجعة شاملة وتحديث فوري لسياسة الأمان السيبراني وإجراءات الاستجابة للحوادث.',
      descriptionEn: 'Following the recent security incident, we need a comprehensive review and immediate update of the cybersecurity policy and incident response procedures.',
      status: 'in_progress',
      priority: 'urgent',
      category: 'مراجعة عاجلة',
      categoryEn: 'Urgent Review',
      project: {
        id: '4',
        name: 'مشروع الأمن السيبراني',
        nameEn: 'Cybersecurity Project'
      },
      client: {
        name: 'لينا الخالد',
        nameEn: 'Lina Al-Khalid',
        organization: 'شركة الاتصالات الرقمية',
        organizationEn: 'Digital Communications Company',
        avatar: 'LK'
      },
      assignedTo: {
        name: 'د. ماجد السلمي',
        role: 'مستشار أمن سيبراني',
        avatar: 'MS'
      },
      createdAt: '2024-10-31T08:00:00Z',
      updatedAt: '2024-10-31T10:45:00Z',
      dueDate: '2024-11-02T23:59:59Z',
      responses: [
        {
          id: '1',
          author: {
            name: 'د. ماجد السلمي',
            role: 'مستشار أمن سيبراني',
            avatar: 'MS'
          },
          message: 'تم البدء فوراً في مراجعة السياسة. سنقدم التحديثات المطلوبة خلال 24 ساعة.',
          messageEn: 'We have immediately started reviewing the policy. We will provide the required updates within 24 hours.',
          timestamp: '2024-10-31T08:30:00Z',
        }
      ],
      attachments: ['تقرير_الحادث_الأمني.pdf'],
      tags: ['عاجل جداً', 'أمن سيبراني', 'حادث أمني'],
      tagsEn: ['Very Urgent', 'Cybersecurity', 'Security Incident']
    }
  ];

  // تصفية التذاكر حسب دور المستخدم
  const getFilteredTickets = () => {
    let tickets = allTickets;

    // تصفية حسب دور المستخدم
    if (userProfile?.role === 'sub_consultant') {
      tickets = tickets.filter(ticket => ticket.assignedTo?.name === 'محمد العتيبي' || ticket.assignedTo?.name === 'ريم الدوسري');
    } else if (userProfile?.role === 'main_client') {
      tickets = tickets.filter(ticket => ticket.client.organization === 'شركة التقنية المتقدمة');
    } else if (userProfile?.role === 'sub_client') {
      tickets = tickets.filter(ticket => ticket.client.organization === 'شركة التقنية المتقدمة' && ticket.priority !== 'urgent');
    }

    // تصفية حسب البحث
    if (searchTerm) {
      tickets = tickets.filter(ticket => 
        (dir === 'rtl' ? ticket.title : ticket.titleEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? ticket.description : ticket.descriptionEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? ticket.category : ticket.categoryEn).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      tickets = tickets.filter(ticket => ticket.status === statusFilter);
    }

    // تصفية حسب الأولوية
    if (priorityFilter !== 'all') {
      tickets = tickets.filter(ticket => ticket.priority === priorityFilter);
    }

    return tickets;
  };

  const filteredTickets = getFilteredTickets();
  const selectedTicketData = selectedTicket ? filteredTickets.find(t => t.id === selectedTicket) : null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: t('tickets.open'), color: 'bg-red-100 text-red-800', icon: AlertCircle },
      in_progress: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800', icon: Clock },
      waiting_response: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      resolved: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      closed: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleSendResponse = () => {
    if (newResponse.trim() && selectedTicketData) {
      // هنا يمكن إضافة منطق إرسال الرد
      console.log('Sending response:', newResponse);
      setNewResponse('');
    }
  };

  const handleCreateTicket = (ticketData: any) => {
    console.log('Creating new ticket:', ticketData);
    alert(`${dir === 'rtl' ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully'}: ${ticketData.title}`);
    setShowCreateTicketModal(false);
  };

  // إحصائيات التذاكر
  const stats = {
    total: filteredTickets.length,
    open: filteredTickets.filter(t => t.status === 'open').length,
    inProgress: filteredTickets.filter(t => t.status === 'in_progress').length,
    resolved: filteredTickets.filter(t => t.status === 'resolved').length,
    overdue: filteredTickets.filter(t => isOverdue(t.dueDate) && t.status !== 'resolved' && t.status !== 'closed').length,
    urgent: filteredTickets.filter(t => t.priority === 'urgent').length,
  };

  if (selectedTicket && selectedTicketData) {
    // عرض تفاصيل التذكرة
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
            {isOverdue(selectedTicketData.dueDate) && selectedTicketData.status !== 'resolved' && (
              <Badge variant="destructive">{dir === 'rtl' ? 'متأخرة' : 'Overdue'}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* تفاصيل التذكرة */}
          <div className="lg:col-span-2 space-y-6">
            {/* الوصف */}
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'تفاصيل الطلب' : 'Request Details'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {dir === 'rtl' ? selectedTicketData.description : selectedTicketData.descriptionEn}
                </p>
                
                {selectedTicketData.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">{dir === 'rtl' ? 'المرفقات:' : 'Attachments:'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicketData.attachments.map((attachment, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicketData.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">{dir === 'rtl' ? 'العلامات:' : 'Tags:'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(dir === 'rtl' ? selectedTicketData.tags : selectedTicketData.tagsEn).map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* المحادثة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {dir === 'rtl' ? 'المحادثة' : 'Conversation'} ({selectedTicketData.responses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTicketData.responses.map((response) => (
                  <div key={response.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {response.author.avatar}
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
                    </div>
                  </div>
                ))}

                {/* إضافة رد جديد */}
                {hasPermission('tickets.respond') && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder={dir === 'rtl' ? 'اكتب ردك هنا...' : 'Write your response here...'}
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Paperclip className="w-4 h-4" />
                          {dir === 'rtl' ? 'إرفاق ملف' : 'Attach File'}
                        </Button>
                        <Button onClick={handleSendResponse} disabled={!newResponse.trim()}>
                          <Send className="w-4 h-4" />
                          {dir === 'rtl' ? 'إرسال الرد' : 'Send Response'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات التذكرة */}
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'معلومات التذكرة' : 'Ticket Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">
                      {dir === 'rtl' ? selectedTicketData.client.name : selectedTicketData.client.nameEn}
                    </p>
                    <p className="text-xs text-gray-600">
                      {dir === 'rtl' ? selectedTicketData.client.organization : selectedTicketData.client.organizationEn}
                    </p>
                  </div>
                </div>

                {selectedTicketData.assignedTo && (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                        {selectedTicketData.assignedTo.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedTicketData.assignedTo.name}</p>
                      <p className="text-xs text-gray-600">{selectedTicketData.assignedTo.role}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">
                      {dir === 'rtl' ? selectedTicketData.project.name : selectedTicketData.project.nameEn}
                    </p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'المشروع المرتبط' : 'Related Project'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(selectedTicketData.dueDate)}</p>
                    <p className="text-xs text-gray-600">{dir === 'rtl' ? 'الموعد النهائي' : 'Due Date'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{dir === 'rtl' ? 'تم الإنشاء:' : 'Created:'}</span>
                    <span>{formatDate(selectedTicketData.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{dir === 'rtl' ? 'آخر تحديث:' : 'Updated:'}</span>
                    <span>{formatDate(selectedTicketData.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* إجراءات */}
            {hasPermission('tickets.edit') && (
              <Card>
                <CardHeader>
                  <CardTitle>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4" />
                    {dir === 'rtl' ? 'تحرير التذكرة' : 'Edit Ticket'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4" />
                    {dir === 'rtl' ? 'إعادة تعيين' : 'Reassign'}
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

  // عرض قائمة التذاكر
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
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي التذاكر' : 'Total Tickets'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              <p className="text-sm text-gray-600">{t('tickets.open')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">{t('tickets.inProgress')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-gray-600">{t('tickets.resolved')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'متأخرة' : 'Overdue'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              <p className="text-sm text-gray-600">{t('tickets.urgent')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{dir === 'rtl' ? 'البحث والتصفية' : 'Search and Filter'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={t('tickets.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'تصفية بالحالة' : 'Filter by Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="open">{t('tickets.open')}</SelectItem>
                  <SelectItem value="in_progress">{t('tickets.inProgress')}</SelectItem>
                  <SelectItem value="waiting_response">{t('tickets.waitingResponse')}</SelectItem>
                  <SelectItem value="resolved">{t('tickets.resolved')}</SelectItem>
                  <SelectItem value="closed">{t('tickets.closed')}</SelectItem>
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
                  <SelectItem value="low">{t('tickets.low')}</SelectItem>
                  <SelectItem value="medium">{t('tickets.medium')}</SelectItem>
                  <SelectItem value="high">{t('tickets.high')}</SelectItem>
                  <SelectItem value="urgent">{t('tickets.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
            isOverdue(ticket.dueDate) && ticket.status !== 'resolved' && ticket.status !== 'closed' ? 'border-red-200 bg-red-50' : ''
          }`} onClick={() => setSelectedTicket(ticket.id)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {ticket.client.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* Ticket Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {dir === 'rtl' ? ticket.title : ticket.titleEn}
                        </h3>
                        <p className="text-sm text-gray-600">
                          #{ticket.id} - {dir === 'rtl' ? ticket.project.name : ticket.project.nameEn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        {isOverdue(ticket.dueDate) && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <Badge variant="destructive">{dir === 'rtl' ? 'متأخرة' : 'Overdue'}</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {dir === 'rtl' ? ticket.description : ticket.descriptionEn}
                    </p>

                    {/* Ticket Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{dir === 'rtl' ? ticket.client.name : ticket.client.nameEn}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{dir === 'rtl' ? ticket.client.organization : ticket.client.organizationEn}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className={isOverdue(ticket.dueDate) && ticket.status !== 'resolved' ? 'text-red-600 font-medium' : ''}>
                          {formatDate(ticket.dueDate)}
                        </span>
                      </div>

                      {ticket.responses.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{ticket.responses.length} {dir === 'rtl' ? 'رد' : 'responses'}</span>
                        </div>
                      )}

                      {ticket.assignedTo && (
                        <div className="flex items-center gap-1">
                          <span>{dir === 'rtl' ? 'مُعيّن لـ:' : 'Assigned to:'} {ticket.assignedTo.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {ticket.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(dir === 'rtl' ? ticket.tags : ticket.tagsEn).slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mr-4">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket.id); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {hasPermission('tickets.respond') && (
                    <Button variant="ghost" size="sm">
                      <Reply className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dir === 'rtl' ? 'لا توجد تذاكر' : 'No Tickets Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? (dir === 'rtl' ? 'لم يتم العثور على تذاكر تطابق معايير البحث' : 'No tickets match your search criteria')
                : (dir === 'rtl' ? 'ابدأ بإنشاء تذكرة دعم جديدة' : 'Start by creating a new support ticket')
              }
            </p>
            {hasPermission('tickets.create') && (
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                {t('tickets.newTicket')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}