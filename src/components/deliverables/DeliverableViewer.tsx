import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen, Download, ZoomIn, ZoomOut, Printer, X, Menu, List, FileText, AlertCircle, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeliverableDTO } from '@/types/api';
import { toast } from '@/components/ui/use-toast';

interface DeliverableViewerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: DeliverableDTO;
}

export function DeliverableViewer({ isOpen, onClose, deliverable }: DeliverableViewerProps) {
  const { language, dir } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  // New States for Secure Viewing
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // --- 1. Helper: Check if browser can natively display this file ---
  // Browsers generally CANNOT display .doc/.docx inside an iframe. They download them instead.
  const isViewable = (filename?: string) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(ext || '');
  };

  // --- 2. Construct URL ---
  const constructUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_API_URL}${cleanPath}`;
  };

  const fileUrl = constructUrl(deliverable.fileUrl);

  // --- 3. FIX: Fetch File Securely for Viewing ---
  useEffect(() => {
    if (!isOpen || !fileUrl) return;

    // If it's a Word Doc, don't try to fetch for preview (browser can't render it anyway)
    if (!isViewable(deliverable.fileName)) {
      return;
    }

    const fetchSecureFile = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const token = localStorage.getItem('accessToken');

        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to load file");

        // Create a local Blob URL from the response
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Preview Error:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecureFile();

    // Cleanup memory when closing
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    };
  }, [isOpen, fileUrl, deliverable.fileName]);


  // --- Toolbar Actions ---
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      toast({ title: "Downloading..." });
      const token = localStorage.getItem('accessToken');
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = deliverable.fileName || `document-${deliverable.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast({ variant: "destructive", title: "Download Failed", description: "Could not download the file." });
    }
  };

  const handlePrint = () => {
    // If we have a loaded blob, print that directly
    if (blobUrl) {
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } else {
      handleDownload(); // Fallback
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 flex flex-col overflow-hidden" dir={dir}>

        {/* --- Header --- */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#1B4FFF]" />
              <div className="overflow-hidden">
                <DialogTitle className="text-xl font-bold text-[#0A1E39] truncate max-w-md" title={deliverable.title}>
                  {dir === 'rtl' ? deliverable.title : (deliverable.titleEn || deliverable.title)}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">v{deliverable.version}</Badge>
                  <Badge variant="outline" className="text-xs uppercase">{deliverable.type}</Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </DialogHeader>

        {/* --- Main Layout --- */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showTableOfContents && (
            <div className="w-80 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
              {/* Sidebar content... */}
              <div className="p-4 text-sm">{deliverable.description}</div>
            </div>
          )}

          {/* Center Stage */}
          <div className="flex-1 flex flex-col bg-gray-100 relative">

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-white flex-shrink-0 z-10">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTableOfContents(!showTableOfContents)}>
                  <Menu className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={handleZoomOut}><ZoomOut className="w-4 h-4" /></Button>
                <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoomLevel}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}><ZoomIn className="w-4 h-4" /></Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleDownload}><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={handlePrint}><Printer className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* --- DOCUMENT VIEWER AREA --- */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-gray-200/50">

              {/* CASE 1: LOADING */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  <p className="text-gray-500 font-medium">Loading secure document...</p>
                </div>
              )}

              {/* CASE 2: ERROR */}
              {!isLoading && error && (
                <div className="text-center bg-white p-8 rounded-lg shadow max-w-md mt-10">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Unable to load document</h3>
                  <p className="text-gray-500 mt-2">We couldn't verify your permission or the file is missing.</p>
                </div>
              )}

              {/* CASE 3: DOCX / NON-VIEWABLE */}
              {!isLoading && !error && !isViewable(deliverable.fileName) && (
                <div className="text-center bg-white p-12 rounded-lg shadow-sm max-w-md mt-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Preview Not Available</h3>
                  <p className="text-gray-500 mt-2 mb-6">
                    This file format ({deliverable.fileName?.split('.').pop()}) cannot be viewed in the browser.
                  </p>
                  <Button onClick={handleDownload} className="w-full">Download to View</Button>
                </div>
              )}

              {/* CASE 4: SUCCESS - SHOW BLOB IN IFRAME */}
              {!isLoading && !error && blobUrl && isViewable(deliverable.fileName) && (
                <div
                  className="bg-white shadow-2xl transition-transform duration-200 origin-top"
                  style={{
                    width: `${800 * (zoomLevel / 100)}px`,
                    height: '100%',
                    minHeight: '800px'
                  }}
                >
                  <iframe
                    src={blobUrl} // <--- USE BLOB URL HERE
                    className="w-full h-full border-none"
                    title="Document Content"
                    allow="fullscreen"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-2 border-t bg-white text-xs text-gray-500 flex-shrink-0">
              <div className="truncate max-w-[200px]">{deliverable.fileName || 'Document'}</div>
              <div>{blobUrl ? '1 / 1' : '0 / 0'}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}