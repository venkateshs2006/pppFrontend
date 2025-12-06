import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Users, 
  FileText, 
  BarChart3, 
  Archive,
  Trash2,
  Copy,
  Share2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  title: string;
  titleEn: string;
  status: string;
}

interface ProjectActionsMenuProps {
  project: Project;
  userRole: string;
  canEdit: boolean;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onManageTeam: (project: Project) => void;
  onManageTasks: (project: Project) => void;
  onViewReports: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onShare: (project: Project) => void;
}

export function ProjectActionsMenu({ 
  project, 
  userRole,
  canEdit,
  onView, 
  onEdit, 
  onManageTeam, 
  onManageTasks, 
  onViewReports, 
  onArchive,
  onDelete, 
  onDuplicate, 
  onShare 
}: ProjectActionsMenuProps) {
  const { language } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">
            {language === 'ar' ? 'فتح القائمة' : 'Open menu'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onView(project)}>
          <Eye className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
        </DropdownMenuItem>
        
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(project)}>
            <Edit className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'تحرير المشروع' : 'Edit Project'}
          </DropdownMenuItem>
        )}
        
        {canEdit && <DropdownMenuSeparator />}
        
        {canEdit && (
          <DropdownMenuItem onClick={() => onManageTeam(project)}>
            <Users className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
          </DropdownMenuItem>
        )}
        
        {/* Tasks are managed by clients and their team, not consultants */}
        {(userRole === 'main_client' || userRole === 'sub_client') && (
          <DropdownMenuItem onClick={() => onManageTasks(project)}>
            <FileText className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'إدارة المهام' : 'Manage Tasks'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onViewReports(project)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'تقارير المشروع' : 'Project Reports'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {canEdit && (
          <DropdownMenuItem onClick={() => onDuplicate(project)}>
            <Copy className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'نسخ المشروع' : 'Duplicate Project'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onShare(project)}>
          <Share2 className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'مشاركة المشروع' : 'Share Project'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {canEdit && project.status !== 'completed' && (
          <DropdownMenuItem onClick={() => onArchive(project)}>
            <Archive className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'أرشفة المشروع' : 'Archive Project'}
          </DropdownMenuItem>
        )}
        
        {canEdit && (
          <DropdownMenuItem 
            onClick={() => onDelete(project)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'حذف المشروع' : 'Delete Project'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}