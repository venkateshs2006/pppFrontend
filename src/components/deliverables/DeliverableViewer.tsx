import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, ChevronRight, BookOpen, FileText, Download, Share2,
  Bookmark, Search, ZoomIn, ZoomOut, Printer, X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeliverableDTO } from '@/types/api';

interface DeliverableViewerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: DeliverableDTO;
}

export function DeliverableViewer({ isOpen, onClose, deliverable }: DeliverableViewerProps) {
  const { language, dir } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // Assuming 1 for now if no content array exists in DTO

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0" dir={dir}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            <DialogHeader className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold truncate" title={deliverable.title}>
                  {language === 'ar' ? deliverable.title : (deliverable.titleEn || deliverable.title)}
                </DialogTitle>
                <Badge variant="outline">v{deliverable.version}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">{deliverable.type}</p>
            </DialogHeader>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">{language === 'ar' ? 'الوصف' : 'Description'}</h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                    {language === 'ar' ? deliverable.description : (deliverable.descriptionEn || deliverable.description)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">{language === 'ar' ? 'التفاصيل' : 'Details'}</h4>
                  <div className="bg-white rounded border divide-y">
                    <div className="p-2 flex justify-between text-sm">
                      <span className="text-gray-500">{language === 'ar' ? 'الحالة' : 'Status'}</span>
                      <Badge variant="secondary">{deliverable.status}</Badge>
                    </div>
                    <div className="p-2 flex justify-between text-sm">
                      <span className="text-gray-500">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</span>
                      <span>{new Date(deliverable.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {/* Toolbar */}
            <div className="h-14 bg-white border-b flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="icon"><ZoomIn className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><ZoomOut className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Printer className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center">
              <div className="bg-white shadow-lg w-full max-w-3xl min-h-full p-12 rounded-sm">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {language === 'ar' ? deliverable.title : (deliverable.titleEn || deliverable.title)}
                  </h1>
                  <Separator />
                  <div className="text-left py-8 text-gray-700">
                    {/* Placeholder for actual content rendering */}
                    <p className="text-center text-gray-400 italic">
                      {language === 'ar' ? 'معاينة المحتوى غير متاحة' : 'Content preview not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Pagination */}
            <div className="h-12 bg-white border-t flex items-center justify-center gap-4">
              <Button variant="ghost" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </Button>
              <span className="text-sm text-gray-600">Page 1 of 1</span>
              <Button variant="ghost" size="sm" disabled>
                {language === 'ar' ? 'التالي' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}