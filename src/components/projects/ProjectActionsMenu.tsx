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
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(project)}>
          <Eye className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
        </DropdownMenuItem>

        {canEdit && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation(); // Prevent row click conflicts
            onEdit(project);
          }}>
            <Edit className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'تحرير المشروع' : 'Edit Project'}
          </DropdownMenuItem>
        )}

        {canEdit && (
          <DropdownMenuItem onClick={() => onManageTeam(project)}>
            <UsersIcon className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'إدارة الفريق' : 'Manage Team'}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onManageTasks(project)}>
          <FileTextIcon className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'إدارة المهام' : 'Manage Tasks'}
        </DropdownMenuItem>

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

// Simple icons to avoid import errors if lucide-react versions mismatch
function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function FileTextIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>; }