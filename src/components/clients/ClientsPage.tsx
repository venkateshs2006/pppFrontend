import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus, Search, Building2, Mail, Phone, MapPin, Calendar,
  BarChart3, Users, Eye, Edit, MoreHorizontal, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, Loader2, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClientFormData, CreateClientModal } from './CreateClientModal';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL;
// --- Interfaces ---
export interface Organization {
  id: string;
  name: string;
  nameEn: string;
  industry?: string;
  industryEn?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'prospect';
  createdAt?: string;
  contactPersonName?: string;
  contactPersonPosition?: string;
  totalValue?: number;
  paidValue?: number;
  projectsCount?: number;
  activeProjectsCount?: number;
  satisfaction?: number;
  revenueCollected?: number;
}

export function ClientsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir, language } = useLanguage();

  // --- State ---
  // 1. Rename API stats to avoid conflict with local variables
  const [apiStats, setApiStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    averageSatisfaction: 0,
    revenueCollected: 0,
    // Add these if your API returns them, otherwise defaults are used
    totalPaid: 0
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for modal loading
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);

  // Helper: Get Auth Headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  });

  // --- 1. API: Fetch Stats (Moved before useEffect) ---
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/organizations/stats`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setApiStats(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }, []);

  // --- 2. API: Fetch Organizations ---
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const orgs = Array.isArray(data) ? data : (data.content || []);
        setOrganizations(orgs);
      } else {
        throw new Error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // --- Effect: Load Data ---
  useEffect(() => {
    fetchOrganizations();
    fetchStats();
  }, [fetchOrganizations, fetchStats]);

  // --- 3. API: Create Organization ---
  const handleCreateClient = async (formData: ClientFormData) => {
    setIsSubmitting(true); // Start loading
    try {
      const payload = {
        name: formData.organizationName,
        nameEn: formData.organizationNameEn,
        industry: formData.industry,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        status: formData.isActive ? 'active' : 'inactive',
        contactPersonName: formData.fullName,
        contactPersonPosition: formData.position,
        adminUsername: formData.username,
        adminPassword: formData.password,
        tags: formData.tags.filter(t => t.trim() !== '')
      };

      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create');
      }

      toast.success(language === 'ar' ? 'تم إضافة العميل بنجاح' : 'Client added successfully');
      setShowCreateClientModal(false);
      fetchOrganizations();
      fetchStats(); // Refresh stats too
    } catch (error: any) {
      console.error(error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الإضافة' : error.message || 'Error adding client');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  // --- 4. API: Delete Organization ---
  const handleDeleteOrganization = async (id: string, name: string) => {
    if (!confirm(language === 'ar' ? `هل أنت متأكد من حذف "${name}"؟` : `Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      setOrganizations(prev => prev.filter(org => org.id !== id));
      fetchStats(); // Refresh stats on delete
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  // --- Filtering Logic ---
  const getFilteredClients = () => {
    let clients = organizations;

    if (userProfile?.role === 'sub_consultant') {
      // Add logic if needed
    }

    if (searchTerm) {
      clients = clients.filter(client =>
        (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.nameEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      clients = clients.filter(client => client.status === statusFilter);
    }

    return clients;
  };

  const filteredClients = getFilteredClients();

  // --- Local Stats (Calculated from List) ---
  // We use this for money calculations if the API stats endpoint doesn't return money values
  const calculatedStats = {
    totalPaid: filteredClients.reduce((sum, c) => sum + (c.paidValue || 0), 0)
  };

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      inactive: { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock },
      prospect: { label: dir === 'rtl' ? 'عميل محتمل' : 'Prospect', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
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
          <Button onClick={() => setShowCreateClientModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('clients.newClient')}
          </Button>
        )}
      </div>

      {/* Stats Cards - Using API Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                <p className="text-2xl font-bold">{apiStats.totalClients}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
                <p className="text-2xl font-bold text-green-600">{apiStats.activeClients}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                <p className="text-2xl font-bold text-purple-600">{apiStats.totalProjects}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إيرادات محصلة' : 'Revenue Collected'}</p>
                {/* Fallback to calculated stats if API doesn't provide money values yet */}
                <p className="text-lg font-bold text-orange-600">{formatCurrency(apiStats.revenueCollected)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common.search')} {t('common.filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={t('clients.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</option>
                <option value="prospect">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</option>
                <option value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        /* Clients Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {language === 'ar' ? client.name : (client.nameEn || client.name)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {language === 'ar' ? client.industry : (client.industryEn || client.industry)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(client.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Person */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{t('clients.contactPerson')}</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{client.contactPersonName || 'N/A'}</p>
                  <p className="text-xs text-gray-600">{client.contactPersonPosition}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{client.email}</span>
                    <span>{client.phone}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{client.city || ''} {client.country ? `, ${client.country}` : ''}</span>
                </div>

                {/* Projects Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{client.projectsCount || 0}</p>
                    <p className="text-xs text-gray-600">{t('clients.totalProjects')}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{client.activeProjectsCount || 0}</p>
                    <p className="text-xs text-gray-600">{t('clients.activeProjects')}</p>
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {dir === 'rtl' ? 'أضيف في:' : 'Added:'} {formatDate(client.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>

                    {hasPermission('clients.edit') && (
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {hasPermission('clients.delete') && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteOrganization(client.id, client.name)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <Button variant="outline" size="sm">
                    {dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ?
                (dir === 'rtl' ? 'لا توجد عملاء تطابق البحث' : 'No clients match your search') :
                (dir === 'rtl' ? 'لا توجد عملاء' : 'No clients found')
              }
            </h3>
            {!searchTerm && statusFilter === 'all' && hasPermission('clients.create') && (
              <Button onClick={() => setShowCreateClientModal(true)}>
                <Plus className="w-4 h-4 ml-2" />
                {t('clients.newClient')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onSuccess={() => {
          console.log("Refetching data...");
          fetchOrganizations();
          fetchStats();
        }}// Refreshes the list
        isLoading={isSubmitting} // Correctly wired up loading state
      />

    </div>
  );
}