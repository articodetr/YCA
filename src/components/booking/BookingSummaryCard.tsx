import { Calendar, Clock, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BookingSummaryCardProps {
  serviceName: string;
  selectedDate: Date | null;
  selectedTime: { startTime: string; endTime: string } | null;
  totalPrice: number;
  serviceType?: string;
  isFormComplete: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function BookingSummaryCard({
  serviceName,
  selectedDate,
  selectedTime,
  totalPrice,
  serviceType,
  isFormComplete,
  onSubmit,
  isSubmitting,
}: BookingSummaryCardProps) {
  const { language } = useLanguage();

  const t = {
    en: {
      title: 'Booking Details',
      service: 'Service',
      serviceType: 'Service Type',
      dateTime: 'Date & Time',
      totalAmount: 'Total Amount',
      proceed: 'Proceed to Pay',
      notSelected: 'Not selected',
      fillForm: 'Please complete all required fields',
      serviceTypes: {
        passport_renewal: 'Passport Renewal',
        visa_application: 'Visa Application',
        document_authentication: 'Document Authentication',
        power_of_attorney: 'Power of Attorney',
        other: 'Other',
      },
    },
    ar: {
      title: 'تفاصيل الحجز',
      service: 'الخدمة',
      serviceType: 'نوع الخدمة',
      dateTime: 'التاريخ والوقت',
      totalAmount: 'المبلغ الإجمالي',
      proceed: 'المتابعة للدفع',
      notSelected: 'لم يتم الاختيار',
      fillForm: 'يرجى إكمال جميع الحقول المطلوبة',
      serviceTypes: {
        passport_renewal: 'تجديد جواز السفر',
        visa_application: 'طلب تأشيرة',
        document_authentication: 'توثيق المستندات',
        power_of_attorney: 'توكيل رسمي',
        other: 'أخرى',
      },
    },
  }[language];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (language === 'ar') {
      return date.toLocaleDateString('ar-EG', options);
    }
    return date.toLocaleDateString('en-GB', options);
  };

  const getServiceTypeLabel = (type: string) => {
    return t.serviceTypes[type as keyof typeof t.serviceTypes] || type;
  };

  const canProceed = selectedDate && selectedTime && isFormComplete;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 h-fit sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        {t.title}
      </h3>

      <div className="space-y-5 mb-6">
        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3 mb-1">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">{t.service}</p>
              <p className="font-semibold text-gray-900 text-sm">{serviceName}</p>
            </div>
          </div>

          {serviceType && (
            <div className="mt-2 pl-11">
              <p className="text-xs text-gray-500 mb-0.5">{t.serviceType}</p>
              <p className="text-sm text-gray-700">{getServiceTypeLabel(serviceType)}</p>
            </div>
          )}
        </div>

        <div className="pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">{t.dateTime}</p>
              {selectedDate && selectedTime ? (
                <>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatDateDisplay(selectedDate)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatTime(selectedTime.startTime)} - {formatTime(selectedTime.endTime)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">{t.notSelected}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-gray-900">{t.totalAmount}</span>
            <span className="text-2xl font-bold text-blue-600">
              £{totalPrice > 0 ? totalPrice.toFixed(0) : 0}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canProceed || isSubmitting}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md disabled:hover:bg-blue-600"
      >
        {t.proceed}
      </button>

      {!canProceed && (
        <p className="text-xs text-gray-500 text-center mt-3">{t.fillForm}</p>
      )}
    </div>
  );
}