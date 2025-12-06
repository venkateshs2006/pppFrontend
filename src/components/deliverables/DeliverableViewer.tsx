import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Download, 
  Share2, 
  Bookmark, 
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Eye,
  X,
  Menu,
  Home,
  List,
  Settings
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeliverableViewerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    type: string;
    status: string;
    version: string;
    pages?: number;
    content?: string[];
  };
}

export function DeliverableViewer({ isOpen, onClose, deliverable }: DeliverableViewerProps) {
  const { language, dir } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample content for demonstration
  const sampleContent = [
    {
      title: language === 'ar' ? 'الفصل الأول: مقدمة' : 'Chapter 1: Introduction',
      content: language === 'ar' ? 
        'هذا المستند يحتوي على السياسات والإجراءات الخاصة بإدارة الموارد البشرية في المؤسسة. يهدف هذا الدليل إلى توضيح الإجراءات المتبعة في جميع العمليات المتعلقة بالموارد البشرية من التوظيف إلى إنهاء الخدمة.\n\nتم إعداد هذا الدليل وفقاً لأفضل الممارسات العالمية ومتطلبات نظام العمل السعودي، ويشمل جميع السياسات اللازمة لضمان بيئة عمل عادلة ومنتجة.\n\nيجب على جميع الموظفين والمديرين الاطلاع على هذا الدليل والالتزام بما جاء فيه من سياسات وإجراءات.' :
        'This document contains the human resources policies and procedures for the organization. This guide aims to clarify the procedures followed in all HR-related processes from recruitment to termination.\n\nThis guide has been prepared according to global best practices and Saudi labor law requirements, and includes all necessary policies to ensure a fair and productive work environment.\n\nAll employees and managers must review this guide and comply with the policies and procedures contained therein.'
    },
    {
      title: language === 'ar' ? 'الفصل الثاني: سياسات التوظيف' : 'Chapter 2: Recruitment Policies',
      content: language === 'ar' ? 
        'تهدف سياسات التوظيف إلى ضمان اختيار أفضل المرشحين للوظائف المتاحة بناءً على الكفاءة والخبرة والمؤهلات المطلوبة.\n\n2.1 إجراءات الإعلان عن الوظائف:\n- يتم الإعلان عن الوظائف الشاغرة عبر القنوات الرسمية للشركة\n- يجب أن يتضمن الإعلان وصفاً واضحاً للوظيفة والمتطلبات\n- مدة الإعلان لا تقل عن أسبوعين\n\n2.2 عملية الفرز والاختيار:\n- مراجعة السير الذاتية وفقاً للمعايير المحددة\n- إجراء المقابلات الأولية والنهائية\n- التحقق من المراجع والشهادات\n- اتخاذ قرار التوظيف بناءً على التقييم الشامل' :
        'Recruitment policies aim to ensure the selection of the best candidates for available positions based on competency, experience, and required qualifications.\n\n2.1 Job Advertisement Procedures:\n- Job vacancies are advertised through official company channels\n- The advertisement must include a clear job description and requirements\n- Advertisement period should not be less than two weeks\n\n2.2 Screening and Selection Process:\n- Review resumes according to specified criteria\n- Conduct preliminary and final interviews\n- Verify references and certificates\n- Make hiring decisions based on comprehensive evaluation'
    },
    {
      title: language === 'ar' ? 'الفصل الثالث: سياسات الإجازات' : 'Chapter 3: Leave Policies',
      content: language === 'ar' ? 
        'تنظم هذه السياسات جميع أنواع الإجازات المتاحة للموظفين وفقاً لنظام العمل السعودي.\n\n3.1 الإجازة السنوية:\n- يحق لكل موظف الحصول على إجازة سنوية مدفوعة الأجر\n- مدة الإجازة السنوية 21 يوم عمل للموظفين الجدد\n- تزيد إلى 30 يوم عمل بعد خمس سنوات من الخدمة\n- يجب تقديم طلب الإجازة قبل شهر من التاريخ المطلوب\n\n3.2 إجازة الأمومة:\n- مدة إجازة الأمومة 10 أسابيع مدفوعة الأجر\n- يحق للموظفة تمديد الإجازة بدون راتب لمدة إضافية\n- يجب تقديم التقارير الطبية اللازمة\n\n3.3 الإجازات المرضية:\n- يحق للموظف الحصول على إجازة مرضية بتقرير طبي\n- الإجازة المرضية مدفوعة الأجر لمدة تصل إلى 120 يوم في السنة' :
        'These policies regulate all types of leave available to employees according to Saudi labor law.\n\n3.1 Annual Leave:\n- Every employee is entitled to paid annual leave\n- Annual leave duration is 21 working days for new employees\n- Increases to 30 working days after five years of service\n- Leave request must be submitted one month before the required date\n\n3.2 Maternity Leave:\n- Maternity leave duration is 10 weeks with full pay\n- Employee may extend leave without pay for additional period\n- Required medical reports must be submitted\n\n3.3 Sick Leave:\n- Employee is entitled to sick leave with medical report\n- Sick leave is paid for up to 120 days per year'
    },
    {
      title: language === 'ar' ? 'الفصل الرابع: تقييم الأداء' : 'Chapter 4: Performance Evaluation',
      content: language === 'ar' ? 
        'يهدف نظام تقييم الأداء إلى قياس أداء الموظفين وتطوير قدراتهم المهنية.\n\n4.1 دورية التقييم:\n- يتم تقييم الأداء بشكل سنوي لجميع الموظفين\n- تقييم نصف سنوي للموظفين الجدد في السنة الأولى\n- تقييم ربع سنوي للمناصب الإدارية العليا\n\n4.2 معايير التقييم:\n- جودة العمل والإنتاجية\n- الالتزام بالمواعيد والحضور\n- التعاون مع الفريق\n- المبادرة والإبداع\n- تحقيق الأهداف المحددة\n\n4.3 نتائج التقييم:\n- ممتاز: 90-100%\n- جيد جداً: 80-89%\n- جيد: 70-79%\n- مقبول: 60-69%\n- ضعيف: أقل من 60%\n\n4.4 خطط التطوير:\n- وضع خطة تطوير فردية لكل موظف\n- تحديد الاحتياجات التدريبية\n- متابعة تنفيذ خطط التطوير' :
        'The performance evaluation system aims to measure employee performance and develop their professional capabilities.\n\n4.1 Evaluation Frequency:\n- Annual performance evaluation for all employees\n- Semi-annual evaluation for new employees in the first year\n- Quarterly evaluation for senior management positions\n\n4.2 Evaluation Criteria:\n- Work quality and productivity\n- Punctuality and attendance\n- Team cooperation\n- Initiative and creativity\n- Achievement of set objectives\n\n4.3 Evaluation Results:\n- Excellent: 90-100%\n- Very Good: 80-89%\n- Good: 70-79%\n- Acceptable: 60-69%\n- Poor: Less than 60%\n\n4.4 Development Plans:\n- Create individual development plan for each employee\n- Identify training needs\n- Follow up on development plan implementation'
    },
    {
      title: language === 'ar' ? 'الفصل الخامس: الخاتمة والمراجع' : 'Chapter 5: Conclusion and References',
      content: language === 'ar' ? 
        'في الختام، يعتبر هذا الدليل مرجعاً شاملاً لجميع السياسات والإجراءات المتعلقة بإدارة الموارد البشرية. يجب مراجعة هذا الدليل بشكل دوري لضمان مواكبته للتطورات والتغييرات في بيئة العمل.\n\nالمراجع:\n- نظام العمل السعودي\n- لائحة تنظيم العمل\n- أفضل الممارسات العالمية في إدارة الموارد البشرية\n- معايير الجودة الدولية ISO 9001\n\nللاستفسارات والتوضيحات، يرجى التواصل مع قسم الموارد البشرية.\n\nتاريخ آخر تحديث: أكتوبر 2024\nرقم الإصدار: 2.1' :
        'In conclusion, this guide serves as a comprehensive reference for all human resources policies and procedures. This guide should be reviewed periodically to ensure it keeps pace with developments and changes in the work environment.\n\nReferences:\n- Saudi Labor Law\n- Work Organization Regulations\n- Global Best Practices in Human Resources Management\n- International Quality Standards ISO 9001\n\nFor inquiries and clarifications, please contact the Human Resources Department.\n\nLast Update: October 2024\nVersion: 2.1'
    }
  ];

  const totalPages = sampleContent.length;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 25);
    }
  };

  const tableOfContents = sampleContent.map((item, index) => ({
    title: item.title,
    page: index + 1
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0" dir={dir}>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#1B4FFF]" />
              <div>
                <DialogTitle className="text-xl font-bold text-[#0A1E39]">
                  {dir === 'rtl' ? deliverable.title : deliverable.titleEn}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {language === 'ar' ? 'الإصدار' : 'Version'} {deliverable.version}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar - Table of Contents */}
          {showTableOfContents && (
            <div className="w-80 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  {language === 'ar' ? 'جدول المحتويات' : 'Table of Contents'}
                </h3>
                <div className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(item.page)}
                      className={`w-full text-left p-2 rounded text-sm hover:bg-white transition-colors ${
                        currentPage === item.page ? 'bg-[#1B4FFF] text-white' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{item.title}</span>
                        <span className="text-xs opacity-70">{item.page}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTableOfContents(!showTableOfContents)}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  {language === 'ar' ? 'المحتويات' : 'Contents'}
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoomLevel}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                  <CardContent 
                    className="p-12 min-h-[800px] bg-white"
                    style={{ 
                      fontSize: `${zoomLevel}%`,
                      lineHeight: '1.8'
                    }}
                  >
                    <div className="prose prose-lg max-w-none" dir={dir}>
                      <h1 className="text-3xl font-bold text-[#0A1E39] mb-8 border-b pb-4">
                        {sampleContent[currentPage - 1]?.title}
                      </h1>
                      
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {sampleContent[currentPage - 1]?.content}
                      </div>

                      {/* Page Footer */}
                      <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                        <div>
                          {dir === 'rtl' ? deliverable.title : deliverable.titleEn}
                        </div>
                        <div>
                          {language === 'ar' ? `صفحة ${currentPage}` : `Page ${currentPage}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {language === 'ar' ? 'السابق' : 'Previous'}
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {language === 'ar' ? 
                    `صفحة ${currentPage} من ${totalPages}` : 
                    `Page ${currentPage} of ${totalPages}`
                  }
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentPage === i + 1 ? 'bg-[#1B4FFF]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
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