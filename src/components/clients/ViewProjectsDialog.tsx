import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, DollarSign, FolderOpen, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/services/clientService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Interface matching Backend ProjectResponseDTO structure
interface Project {
    id: string;
    titleEn?: string; // Marked optional to handle potential nulls safely
    titleAr?: string;
    status: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    progress: number;
    client?: {
        id: number;
        name: string;
    };
    organizationId?: number;
}

interface ViewProjectsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    org: ApiClient | null;
}

export function ViewProjectsDialog({ open, onOpenChange, org }: ViewProjectsDialogProps) {
    const { dir } = useLanguage();
    const token = localStorage.getItem('accessToken');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // --- Fetch Projects Logic ---
    useEffect(() => {
        if (open && org) {
            setLoading(true);
            setError('');
            setProjects([]); // Clear previous state

            const fetchProjects = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/projects`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Handle both list wrapped in 'data' or direct list
                        const allProjects: Project[] = Array.isArray(data) ? data : (data.data || []);

                        console.log("All Projects Fetched:", allProjects); // 🔍 Debug Log 1
                        console.log("Filtering for Org ID:", org.id);      // 🔍 Debug Log 2

                        // Filter projects belonging to this organization
                        const orgProjects = allProjects.filter(p => {
                            const projectClientId = p.client?.id || p.organizationId;
                            // Use loose equality (==) to match string "5" with number 5
                            return projectClientId == org.id;
                        });

                        console.log("Matches Found:", orgProjects);        // 🔍 Debug Log 3
                        setProjects(orgProjects);
                    } else {
                        setError('Failed to fetch projects');
                    }
                } catch (err) {
                    console.error("Error loading projects:", err);
                    setError('Network error occurred');
                } finally {
                    setLoading(false);
                }
            };

            fetchProjects();
        }
    }, [open, org, token]);

    // Helper to format status badges
    const getStatusBadge = (status: string) => {
        const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';

        const styles: Record<string, string> = {
            'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
            'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
            'PLANNED': 'bg-gray-100 text-gray-800 border-gray-200',
            'ON_HOLD': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
        };

        const displayLabel: Record<string, string> = {
            'IN_PROGRESS': 'In Progress',
            'COMPLETED': 'Completed',
            'PLANNED': 'Planned',
            'ON_HOLD': 'On Hold',
            'CANCELLED': 'Cancelled'
        };

        return (
            <Badge variant="outline" className={styles[normalizedStatus] || 'bg-gray-100'}>
                {displayLabel[normalizedStatus] || normalizedStatus}
            </Badge>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Safe Filtering to prevent crashes on null titles
    const filteredProjects = projects.filter(p => {
        const term = searchTerm.toLowerCase();
        const enTitle = p.titleEn ? p.titleEn.toLowerCase() : '';
        const arTitle = p.titleAr ? p.titleAr : '';
        return enTitle.includes(term) || arTitle.includes(term);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col" dir={dir}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        {org ? `${dir === 'rtl' ? 'مشاريع:' : 'Projects:'} ${org.name}` : (dir === 'rtl' ? 'المشاريع' : 'Projects')}
                    </DialogTitle>
                </DialogHeader>

                {/* Search Bar */}
                <div className="relative my-2">
                    <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <Input
                        placeholder={dir === 'rtl' ? 'بحث عن المشاريع...' : "Search projects..."}
                        className={dir === 'rtl' ? 'pr-9' : 'pl-9'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>{dir === 'rtl' ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <AlertCircle className="w-8 h-8 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FolderOpen className="w-12 h-12 mb-2 opacity-20" />
                            <p>{dir === 'rtl' ? 'لا توجد مشاريع لهذه المؤسسة.' : 'No projects found for this organization.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="group flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-gray-900">
                                                {/* Safe Title Rendering */}
                                                {dir === 'rtl'
                                                    ? (project.titleAr || project.titleEn || 'Untitled')
                                                    : (project.titleEn || project.titleAr || 'Untitled')}
                                            </h4>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(project.startDate)}
                                            </span>
                                            {project.budget !== null && project.budget !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {project.budget.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-2">
                                        {/* Progress Bar */}
                                        <div className="w-24 hidden sm:block">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{dir === 'rtl' ? 'الإنجاز' : 'Progress'}</span>
                                                <span>{project.progress || 0}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${project.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2 border-t mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {dir === 'rtl' ? 'إغلاق' : 'Close'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}