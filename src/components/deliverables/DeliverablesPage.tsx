import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FileText, Plus, Eye, Loader2, RefreshCw, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { deliverableService, Deliverable } from '@/services/deliverableService';
import { projectService } from '@/services/projectService';
import { DeliverableFormDialog } from './DeliverableFormDialog';
import { DeliverableViewer } from './DeliverableViewer';
import { toast } from '@/components/ui/use-toast';

// Basic Project Interface
interface ProjectDropDown {
  id: string;
  name: string;
}

export function DeliverablesPage() {
  const { userProfile } = useAuth();

  // --- State ---
  const [projects, setProjects] = useState<ProjectDropDown[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  // Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  // Loading States
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);

  // --- 1. Fetch Projects on Mount ---
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await projectService.getAllProjects();
        // FIX: Map the raw data to the format the component expects
        const formattedProjects: ProjectDropDown[] = Array.isArray(data) ? data.map((item: any) => ({
          id: String(item.id),
          name: item.titleEn || item.name || 'Unnamed Project'
        })) : [];
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Failed to load projects", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load projects list." });
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // --- 2. Fetch Deliverables when Project Changes ---
  useEffect(() => {
    if (selectedProjectId) {
      loadDeliverables(selectedProjectId);
    } else {
      setDeliverables([]);
    }
  }, [selectedProjectId]);

  const loadDeliverables = async (projectId: string) => {
    setLoadingDeliverables(true);
    try {
      const data = await deliverableService.getByProject(projectId);
      setDeliverables(data);
    } catch (err) {
      console.error("Failed to load deliverables", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load deliverables." });
    } finally {
      setLoadingDeliverables(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this deliverable? This action cannot be undone.")) {
      return;
    }

    try {
      await deliverableService.delete(id); // Ensure this method exists in your service
      toast({ title: "Deleted", description: "Deliverable deleted successfully." });
      // Refresh list
      loadDeliverables(selectedProjectId);
    } catch (error) {
      console.error("Delete failed", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete deliverable." });
    }
  };

  // --- 4. Handle Edit Click ---
  const handleEditClick = (del: Deliverable) => {
    setSelectedDeliverable(del); // Set the item to be edited
    setIsDialogOpen(true);       // Open the form
  };

  // --- 5. Handle Create Click ---
  const handleCreateClick = () => {
    setSelectedDeliverable(null); // Clear previous selection for new item
    setIsDialogOpen(true);
  };

  // --- Helper: Status Colors ---
  const getStatusColor = (status: string) => {
    const statusKey = status ? status.toLowerCase() : '';
    const map: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'redo': 'bg-red-100 text-white-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return map[statusKey] || 'bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deliverables Management</h1>
          <p className="text-gray-500 text-sm">Manage project documents and approvals</p>
        </div>

        {/* Project Selector */}
        <div className="w-72">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={loadingProjects}>
            <SelectTrigger>
              <SelectValue placeholder={loadingProjects ? "Loading Projects..." : "Select a Project..."} />
            </SelectTrigger>
            <SelectContent>
              {projects.length === 0 && !loadingProjects ? (
                <div className="p-2 text-sm text-gray-500 text-center">No projects found</div>
              ) : (
                projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedProjectId ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              Deliverables ({deliverables.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => loadDeliverables(selectedProjectId)} disabled={loadingDeliverables}>
                <RefreshCw className={`w-4 h-4 ${loadingDeliverables ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-2" /> Add Deliverable
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDeliverables ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : deliverables.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No deliverables found for this project.</p>
                <Button variant="link" onClick={handleCreateClick}>Create the first one</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {deliverables.map(del => (
                  <div key={del.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${del.type === 'POLICY' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{del.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Badge variant="outline" className="text-xs font-normal capitalize">
                            {del.type.toLowerCase()}
                          </Badge>
                          <span>•</span>
                          <span>v{del.version}</span>
                          <span>•</span>
                          <span>Updated: {new Date(del.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={`${getStatusColor(del.status)} border-0`}>
                        {del.status.replace(/_/g, ' ')}
                      </Badge>

                      <div className="flex items-center gap-1">
                        {/* VIEW Button */}
                        <Button variant="outline" size="sm" onClick={() => { setSelectedDeliverable(del); setIsViewerOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>

                        {/* ACTIONS Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(del)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(del.id)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-gray-50 text-gray-500">
          <FileText className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No Project Selected</p>
          <p className="text-sm">Please select a project from the dropdown above to manage its deliverables.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isDialogOpen && (
        <DeliverableFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          projectId={selectedProjectId}
          deliverable={selectedDeliverable} // Passes the item to edit, or null for create
          onSuccess={() => loadDeliverables(selectedProjectId)} // Refreshes list after save
        />
      )}

      {/* Viewer Modal */}
      {isViewerOpen && selectedDeliverable && (
        <DeliverableViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          deliverable={selectedDeliverable}
        />
      )}
    </div>
  );
}