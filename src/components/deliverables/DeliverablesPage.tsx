import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Assumed for getting projectId
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateDeliverableModal } from './CreateDeliverableModal';
import { DeliverableViewer } from './DeliverableViewer';
import {
  Plus, Search, FolderTree, ChevronRight, ChevronDown, File,
  FileText, Eye, Edit, Download, Upload, BookOpen,
  FileCheck, FileX, Clock, CheckCircle2, AlertCircle, Trash2, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner'; // Assuming you use sonner or similar

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface DeliverableDTO {
  id: string;
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  type: 'guide' | 'topic' | 'policy' | 'procedure' | 'template';
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  version: number;
  parentId?: string; // Important for tree structure
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
  authorName?: string;
  authorRole?: string;
}

interface DeliverableNode extends DeliverableDTO {
  children: DeliverableNode[];
  // Mapped UI fields if different from API
  project?: { name: string; nameEn: string };
  author?: { name: string; role: string };
  lastModified?: string;
}

export function DeliverablesPage() {
  const { projectId } = useParams<{ projectId: string }>(); // Get ID from URL
  const { userProfile } = useAuth();
  const { t, dir, language } = useLanguage();

  // State
  const [deliverables, setDeliverables] = useState<DeliverableNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [showViewer, setShowViewer] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableNode | null>(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  });

  // --- 1. Helper: Build Tree from Flat API List ---
  const buildTree = (items: DeliverableDTO[]): DeliverableNode[] => {
    const map: Record<string, DeliverableNode> = {};
    const roots: DeliverableNode[] = [];

    // First pass: create nodes and map them
    items.forEach(item => {
      map[item.id] = {
        ...item,
        children: [],
        // Map API flat fields to UI nested objects if needed
        lastModified: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '',
        author: { name: item.authorName || 'Unknown', role: item.authorRole || 'Consultant' },
        project: { name: 'Project', nameEn: 'Project' } // Placeholder or fetch actual project name
      };
    });

    // Second pass: connect parents and children
    items.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  // --- 2. API: Fetch Deliverables ---
  const fetchDeliverables = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // GET /api/deliverables/project/{projectId}
      const response = await fetch(`${API_BASE_URL}/deliverables/project/${projectId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data: DeliverableDTO[] = await response.json();
        const treeStructure = buildTree(data);
        setDeliverables(treeStructure);

        // Auto-expand root nodes
        const rootIds = treeStructure.map(n => n.id);
        setExpandedNodes(new Set(rootIds));
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل تحميل المخرجات' : 'Failed to load deliverables');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, language]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  // --- 3. API: Create Deliverable ---
  const handleCreateDeliverable = (parentId?: string) => {
    setSelectedParentId(parentId);
    setShowCreateModal(true);
  };

  const handleCreateDeliverableSubmit = async (formData: any) => {
    try {
      // POST /api/deliverables
      const payload = {
        ...formData,
        projectId: projectId,
        parentId: selectedParentId || null,
        status: 'draft', // Default status
        version: 1
      };

      const response = await fetch(`${API_BASE_URL}/deliverables`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create');

      toast.success(language === 'ar' ? 'تم إنشاء المخرج بنجاح' : 'Deliverable created successfully');
      setShowCreateModal(false);
      fetchDeliverables(); // Refresh tree
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الإنشاء' : 'Error creating deliverable');
    }
  };

  // --- 4. API: Delete Deliverable ---
  const handleDeleteDeliverable = async (id: string, title: string) => {
    if (!confirm(language === 'ar' ? `هل أنت متأكد من حذف "${title}"؟` : `Are you sure you want to delete "${title}"?`)) return;

    try {
      // DELETE /api/deliverables/{id}
      const response = await fetch(`${API_BASE_URL}/deliverables/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchDeliverables(); // Refresh tree
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  // --- Handlers ---
  const handleViewDeliverable = (deliverable: DeliverableNode) => {
    setSelectedDeliverable(deliverable);
    setShowViewer(true);
  };

  const handleEditDeliverable = (deliverable: DeliverableNode) => {
    // Logic to open Edit Modal (reuses CreateModal with initial data usually)
    // For now, just logging or you can implement a separate Edit state
    console.log("Edit requested for:", deliverable.id);
    // You would typically setEditingDeliverable(deliverable) and open the modal here
    // Then use PUT /api/deliverables/{id} on submit
  };

  const canEditDeliverables = (userRole: string) => {
    return ['system_admin', 'lead_consultant', 'sub_consultant', 'super_admin'].includes(userRole);
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

  // --- UI Helpers ---
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'policy': return <FileCheck className="w-4 h-4 text-green-500" />;
      case 'procedure': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'template': return <File className="w-4 h-4 text-orange-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      draft: { label: language === 'ar' ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileX },
      review: { label: language === 'ar' ? 'قيد المراجعة' : 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: language === 'ar' ? 'معتمد' : 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      published: { label: language === 'ar' ? 'منشور' : 'Published', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      rejected: { label: language === 'ar' ? 'مرفوض' : 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  // Recursive Render
  const renderTreeNode = (node: DeliverableNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="space-y-2">
        <Card className={`hover:shadow-md transition-shadow ${level > 0 ? (dir === 'rtl' ? 'mr-6' : 'ml-6') : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Expand Toggle */}
                <Button variant="ghost" size="sm"
                  onClick={() => toggleNode(node.id)}
                  className={`p-1 h-6 w-6 ${!hasChildren ? 'invisible' : ''}`}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>

                <div className="flex-shrink-0">{getTypeIcon(node.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-sm truncate">
                      {language === 'ar' ? node.title : node.titleEn}
                    </h3>
                    {getStatusBadge(node.status)}
                    <Badge variant="outline" className="text-xs">v{node.version}</Badge>
                  </div>

                  {(node.description || node.descriptionEn) && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {language === 'ar' ? node.description : node.descriptionEn}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{node.author?.name}</span>
                    <span>{node.lastModified}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDeliverable(node)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{language === 'ar' ? 'عرض' : 'View'}</p></TooltipContent>
                </Tooltip>

                {canEditDeliverables(userProfile?.role || '') && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleEditDeliverable(node)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{language === 'ar' ? 'تحرير' : 'Edit'}</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleCreateDeliverable(node.id)}>
                          <Plus className="w-4 h-4 text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{language === 'ar' ? 'إضافة فرعي' : 'Add Sub-item'}</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDeliverable(node.id, node.title)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{language === 'ar' ? 'حذف' : 'Delete'}</p></TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <div className="space-y-2 border-l-2 border-gray-100 dark:border-gray-800 ml-3 pl-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // --- Filtering ---
  const filterNodes = (nodes: DeliverableNode[]): DeliverableNode[] => {
    if (!searchTerm) return nodes;

    return nodes.reduce((acc: DeliverableNode[], node) => {
      const matches = (language === 'ar' ? node.title : node.titleEn).toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = filterNodes(node.children);

      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const displayedDeliverables = filterNodes(deliverables);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('deliverables.title')}</h1>
            <p className="text-gray-600 mt-1">{t('deliverables.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Main Add Button (Root Level) */}
            {canEditDeliverables(userProfile?.role || '') && (
              <Button className="flex items-center gap-2" onClick={() => handleCreateDeliverable()}>
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'مخرج جديد' : 'New Deliverable'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats & Search removed for brevity, keep your existing code for them */}

        {/* Tree Render */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              {language === 'ar' ? 'شجرة المخرجات' : 'Deliverables Tree'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {displayedDeliverables.length > 0 ? (
                  displayedDeliverables.map(node => renderTreeNode(node))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{language === 'ar' ? 'لا توجد مخرجات' : 'No deliverables found'}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <CreateDeliverableModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDeliverableSubmit}
          parentId={selectedParentId}
        />

        {selectedDeliverable && (
          <DeliverableViewer
            isOpen={showViewer}
            onClose={() => { setShowViewer(false); setSelectedDeliverable(null); }}
            deliverable={{
              ...selectedDeliverable,
              description: selectedDeliverable.description || '',
              descriptionEn: selectedDeliverable.descriptionEn || '',
              version: String(selectedDeliverable.version)
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}