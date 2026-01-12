import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus, Search, Building2, Mail, BarChart3, Edit, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, Loader2, Trash2, Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { organizationService, ApiClient, CreateUpdateClientRequest } from '@/services/clientService';
import { OrganizationFormDialog } from '@/components/clients/OrganizationFormDialog';
import { ViewOrganizationDialog } from '@/components/clients/ViewOrganizationDialog';
import { ViewProjectsDialog } from '@/components/clients/ViewProjectsDialog';
export function ClientsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  // --- State ---
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    revenueCollected: 0
  });

  const [organizations, setOrganizations] = useState<ApiClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // 2. Add State for View Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewOrg, setViewOrg] = useState<ApiClient | null>(null);
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<ApiClient | null>(null);
  // 2. Add State for Project Dialog
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectDialogOrg, setProjectDialogOrg] = useState<ApiClient | null>(null);

  // 3. Create Handler
  const handleViewProjects = (org: ApiClient) => {
    setProjectDialogOrg(org);
    setIsProjectDialogOpen(true);
  };
  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orgsData, statsData] = await Promise.all([
        organizationService.getAll(),
        organizationService.getStats()
      ]);
      setOrganizations(orgsData);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---
  const handleCreateUpdate = async (data: CreateUpdateClientRequest) => {
    try {
      if (selectedOrg) {
        // Update
        await organizationService.update(selectedOrg.id, data);
        toast({ title: "Updated successfully" });
      } else {
        // Create
        await organizationService.create(data);
        toast({ title: "Created successfully" });
      }
      fetchData(); // Refresh list
    } catch (error) {
      toast({ variant: "destructive", title: "Operation failed" });
      throw error;
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(dir === 'rtl' ? `حذف ${name}؟` : `Delete ${name}?`)) return;
    try {
      await organizationService.delete(id);
      toast({ title: "Deleted successfully" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const openCreateModal = () => {
    setSelectedOrg(null);
    setIsDialogOpen(true);
  };

  const openEditModal = (org: ApiClient) => {
    setSelectedOrg(org);
    setIsDialogOpen(true);
  };

  const openDetails = (id: number) => {
    navigate(`/clients/${id}`);
  };
  // 3. Update the openDetails function
  const openViewDialog = (org: ApiClient) => {
    setViewOrg(org);
    setIsViewDialogOpen(true);
  };
  // --- Helpers ---
  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') return <Badge className="bg-green-100 text-green-800 flex gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>;
    if (status === 'INACTIVE') return <Badge className="bg-gray-100 text-gray-800 flex gap-1"><Clock className="w-3 h-3" /> Inactive</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 flex gap-1"><AlertTriangle className="w-3 h-3" /> {status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('clients.title')}</h1>
          <p className="text-gray-600 mt-1">{t('clients.description')}</p>
        </div>
        {hasPermission('clients.create') && (
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('clients.newClient')}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex justify-between"><div><p className="text-sm text-gray-600">Total Clients</p><p className="text-2xl font-bold">{stats.totalClients}</p></div><Building2 className="text-blue-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between"><div><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">{stats.activeClients}</p></div><CheckCircle2 className="text-green-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between"><div><p className="text-sm text-gray-600">Total Projects</p><p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p></div><BarChart3 className="text-purple-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between"><div><p className="text-sm text-gray-600">Revenue</p><p className="text-2xl font-bold text-orange-600">{stats.revenueCollected}</p></div><TrendingUp className="text-orange-500" /></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{org.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <p className="text-sm text-gray-500">{org.subscriptionPlan} Plan</p>
                    </div>
                  </div>
                  {getStatusBadge(org.subscriptionStatus || 'INACTIVE')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium">Contact: {org.contactPersonName || 'N/A'}</p>
                  <div className="flex gap-2 text-gray-500 mt-1">
                    <Mail className="w-3 h-3" /> {org.contactEmail || 'No email'}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                  <span>Projects: <b>{org.projectsCount || 0}</b></span>
                  <span>Active: <b>{org.activeProjectsCount || 0}</b></span>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openViewDialog(org)}><Eye className="w-4 h-4 text-gray-600" /></Button>
                  {hasPermission('clients.edit') && (
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(org)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  )}
                  {hasPermission('clients.delete') && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(org.id, org.name)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleViewProjects(org)}>View Projects</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrganizationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orgToEdit={selectedOrg}
        onSubmit={handleCreateUpdate}
      />
      {/* 4. Update your buttons to pass the whole object, not just ID */}
      <Button variant="ghost" size="sm" onClick={() => openViewDialog(org)}>
        <Eye className="w-4 h-4 text-gray-600" />
      </Button>

      {/* 5. Add the Dialog Component at the bottom */}
      <ViewOrganizationDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        org={viewOrg}
      />
      <ViewProjectsDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        org={projectDialogOrg}
      />
    </div>

  );
}