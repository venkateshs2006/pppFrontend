import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Calendar, Mail, CheckCircle2 } from 'lucide-react';
import { organizationService, ApiClient } from '@/services/clientService';
import { useLanguage } from '@/contexts/LanguageContext';

export function OrganizationDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { dir } = useLanguage();
    const [org, setOrg] = useState<ApiClient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            organizationService.getById(id)
                .then(setOrg)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!org) return <div className="p-8 text-center">Organization not found</div>;

    return (
        <div className="p-6 space-y-6" dir={dir}>
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Button>

            {/* Header Info */}
            <Card>
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                        {org.name[0]}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{org.name}</h1>
                        <p className="text-gray-500 mt-2">{org.description}</p>
                        <div className="flex gap-4 mt-4">
                            <Badge>{org.subscriptionPlan}</Badge>
                            <Badge variant={org.subscriptionStatus === 'ACTIVE' ? 'default' : 'destructive'}>
                                {org.subscriptionStatus}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <div className="flex gap-2 items-center"><Building2 className="w-4 h-4" /> {org.contactPersonName}</div>
                        <div className="flex gap-2 items-center"><Mail className="w-4 h-4" /> {org.contactEmail}</div>
                        <div className="flex gap-2 items-center"><Calendar className="w-4 h-4" /> Joined: {new Date(org.createdAt).toLocaleDateString()}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Projects Section */}
            <h2 className="text-2xl font-semibold">Related Projects ({org.projectsCount})</h2>

            {org.projectsCount === 0 ? (
                <Card><CardContent className="p-8 text-center text-gray-500">No projects found for this organization.</CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* TODO: Integrate with Real Projects API.
            Example: const projects = await projectService.getByOrgId(org.id);
          */}
                    {Array.from({ length: org.projectsCount || 0 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">Project #{i + 1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">Sample project description related to {org.name}.</p>
                                <div className="flex justify-between items-center">
                                    <Badge variant="outline">In Progress</Badge>
                                    <Button size="sm" variant="link">View Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}