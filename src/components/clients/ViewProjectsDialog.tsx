import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, DollarSign, FolderOpen, ExternalLink, Loader2 } from 'lucide-react';
import { ApiClient } from '@/services/clientService';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Mock Project Interface (Replace with your actual Project Type) ---
interface Project {
    id: string;
    name: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    startDate: string;
    budget: number;
    progress: number;
}

interface ViewProjectsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    org: ApiClient | null;
}

export function ViewProjectsDialog({ open, onOpenChange, org }: ViewProjectsDialogProps) {
    const { dir } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Fetch Projects Logic ---
    useEffect(() => {
        if (open && org) {
            setLoading(true);
            // TODO: Replace with actual API call: 
            // await axios.get(`/api/projects?organizationId=${org.id}`)

            // Simulating API delay and response
            setTimeout(() => {
                const mockProjects: Project[] = Array.from({ length: org.projectsCount || 0 }).map((_, i) => ({
                    id: `proj-${i}`,
                    name: `${org.name} - Phase ${i + 1} Implementation`,
                    status: i === 0 ? 'In Progress' : (i < 3 ? 'Completed' : 'Not Started'),
                    startDate: '2025-01-15',
                    budget: 50000 + (i * 10000),
                    progress: i === 0 ? 45 : (i < 3 ? 100 : 0)
                }));
                setProjects(mockProjects);
                setLoading(false);
            }, 800);
        }
    }, [open, org]);

    const getStatusBadge = (status: string) => {
        const styles = {
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Not Started': 'bg-gray-100 text-gray-800',
            'On Hold': 'bg-yellow-100 text-yellow-800'
        };
        return <Badge className={styles[status as keyof typeof styles] || ''}>{status}</Badge>;
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col" dir={dir}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        {org ? `Projects: ${org.name}` : 'Projects'}
                    </DialogTitle>
                </DialogHeader>

                {/* Search Bar */}
                <div className="relative my-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Loading projects...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FolderOpen className="w-12 h-12 mb-2 opacity-20" />
                            <p>No projects found for this organization.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="group flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.startDate}</span>
                                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${project.budget.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Progress Bar (Visual only) */}
                                        <div className="w-24 hidden sm:block">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}