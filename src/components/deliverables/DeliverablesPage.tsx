import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateDeliverableModal } from './CreateDeliverableModal';
import { DeliverableViewer } from './DeliverableViewer';
import {
  Plus,
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FileText,
  Eye,
  Edit,
  Download,
  Upload,
  MoreHorizontal,
  BookOpen,
  FileCheck,
  FileX,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeliverableNode {
  id: string;
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  type: 'guide' | 'topic' | 'policy' | 'procedure' | 'template';
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  version: number;
  project: {
    id: string;
    name: string;
    nameEn: string;
  };
  author: {
    name: string;
    role: string;
  };
  lastModified: string;
  approver?: {
    name: string;
    date: string;
  };
  comments?: number;
  children: DeliverableNode[];
}

export function DeliverablesPage() {
  const { userProfile } = useAuth();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '6', '11', '16']));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [showViewer, setShowViewer] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableNode | null>(null);

  // Sample data - simplified for now
  const deliverableTree: DeliverableNode[] = [
    {
      id: '1',
      title: 'دليل سياسات الموارد البشرية الشامل',
      titleEn: 'Comprehensive HR Policies Manual',
      description: 'الدليل الرئيسي لجميع سياسات وإجراءات الموارد البشرية في المؤسسة',
      descriptionEn: 'Main manual for all HR policies and procedures in the organization',
      type: 'guide',
      status: 'review',
      version: 2,
      project: { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' },
      author: { name: 'د. سارة الأحمد', role: 'مستشار أول' },
      lastModified: '2024-10-30',
      comments: 8,
      children: []
    }
  ];

  // Handler functions
  const handleCreateDeliverable = (parentId?: string) => {
    setSelectedParentId(parentId);
    setShowCreateModal(true);
  };

  const handleCreateDeliverableSubmit = (deliverableData: any) => {
    console.log('Creating deliverable:', deliverableData);
    alert(`${dir === 'rtl' ? 'تم إنشاء المخرج:' : 'Deliverable created:'} ${deliverableData.title}`);
  };

  const handleViewDeliverable = (deliverable: DeliverableNode) => {
    setSelectedDeliverable(deliverable);
    setShowViewer(true);
  };

  const handleEditDeliverable = (deliverable: DeliverableNode) => {
    alert(`${dir === 'rtl' ? 'تحرير المخرج:' : 'Editing deliverable:'} ${dir === 'rtl' ? deliverable.title : deliverable.titleEn}`);
  };

  const handleDownloadDeliverable = (deliverable: DeliverableNode) => {
    alert(`${dir === 'rtl' ? 'تحميل المخرج:' : 'Downloading deliverable:'} ${dir === 'rtl' ? deliverable.title : deliverable.titleEn}`);
  };

  const handleUploadVersion = (deliverable: DeliverableNode) => {
    alert(`${dir === 'rtl' ? 'رفع إصدار جديد للمخرج:' : 'Uploading new version for:'} ${dir === 'rtl' ? deliverable.title : deliverable.titleEn}`);
  };

  // Check if user can edit deliverables
  const canEditDeliverables = (userRole: string) => {
    return userRole === 'system_admin' || userRole === 'lead_consultant' || userRole === 'sub_consultant';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'policy':
        return <FileCheck className="w-4 h-4 text-green-500" />;
      case 'procedure':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'template':
        return <File className="w-4 h-4 text-orange-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: dir === 'rtl' ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileX },
      review: { label: dir === 'rtl' ? 'قيد المراجعة' : 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: dir === 'rtl' ? 'معتمد' : 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      published: { label: dir === 'rtl' ? 'منشور' : 'Published', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      rejected: { label: dir === 'rtl' ? 'مرفوض' : 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: FileX };
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: DeliverableNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="space-y-2">
        <Card className={`hover:shadow-md transition-shadow ${level > 0 ? `${dir === 'rtl' ? 'mr-6' : 'ml-6'}` : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(node.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}

                <div className="flex-shrink-0">
                  {getTypeIcon(node.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">
                      {dir === 'rtl' ? node.title : node.titleEn}
                    </h3>
                    {getStatusBadge(node.status)}
                    <Badge variant="outline" className="text-xs">
                      v{node.version}
                    </Badge>
                  </div>

                  {node.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {dir === 'rtl' ? node.description : node.descriptionEn}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{node.author.name}</span>
                    <span>{node.lastModified}</span>
                    <span>{dir === 'rtl' ? node.project.name : node.project.nameEn}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDeliverable(node)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dir === 'rtl' ? 'عرض تفاصيل المخرج' : 'View deliverable details'}</p>
                  </TooltipContent>
                </Tooltip>

                {canEditDeliverables(userProfile?.role || '') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleEditDeliverable(node)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{dir === 'rtl' ? 'تحرير المخرج' : 'Edit deliverable'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadDeliverable(node)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dir === 'rtl' ? 'تحميل المخرج' : 'Download deliverable'}</p>
                  </TooltipContent>
                </Tooltip>

                {canEditDeliverables(userProfile?.role || '') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleCreateDeliverable(node.id)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{dir === 'rtl' ? 'إضافة مخرج فرعي' : 'Add sub-deliverable'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = deliverableTree.filter(node =>
    searchTerm === '' ||
    (dir === 'rtl' ? node.title : node.titleEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (node.description && (dir === 'rtl' ? node.description : node.descriptionEn || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('deliverables.title')}</h1>
            <p className="text-gray-600 mt-1">{t('deliverables.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEditDeliverables(userProfile?.role || '') && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => handleUploadVersion({ id: 'new' } as DeliverableNode)}>
                      <Upload className="w-4 h-4" />
                      {dir === 'rtl' ? 'رفع ملف' : 'Upload File'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dir === 'rtl' ? 'رفع ملف مخرج جديد' : 'Upload new deliverable file'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="flex items-center gap-2" onClick={() => handleCreateDeliverable()}>
                      <Plus className="w-4 h-4" />
                      {dir === 'rtl' ? 'مخرج جديد' : 'New Deliverable'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dir === 'rtl' ? 'إضافة مخرج جديد' : 'Add new deliverable'}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={dir === 'rtl' ? 'البحث في المخرجات...' : 'Search deliverables...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{filteredTree.length}</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي المخرجات' : 'Total Deliverables'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'قيد المراجعة' : 'Under Review'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'معتمد' : 'Approved'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'مسودة' : 'Draft'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliverables Tree */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              {dir === 'rtl' ? 'شجرة المخرجات' : 'Deliverables Tree'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTree.length > 0 ? (
                filteredTree.map(node => renderTreeNode(node))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{dir === 'rtl' ? 'لا توجد مخرجات' : 'No deliverables found'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Deliverable Modal */}
        <CreateDeliverableModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDeliverableSubmit}
          parentId={selectedParentId}
        />

        {/* Deliverable Viewer */}
        {selectedDeliverable && (
          <DeliverableViewer
            isOpen={showViewer}
            onClose={() => {
              setShowViewer(false);
              setSelectedDeliverable(null);
            }}
            deliverable={{
              id: selectedDeliverable.id,
              title: selectedDeliverable.title,
              titleEn: selectedDeliverable.titleEn,
              description: selectedDeliverable.description || '',
              descriptionEn: selectedDeliverable.descriptionEn || '',
              type: selectedDeliverable.type,
              status: selectedDeliverable.status,
              version: selectedDeliverable.version.toString()
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}