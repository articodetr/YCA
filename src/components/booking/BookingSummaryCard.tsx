import { Calendar, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BookingSummaryCardProps {
  service: { name_en: string; name_ar: string } | null;
  selectedDate: Date | null;
  selectedSlot: { startTime: string; endTime: string } | null;
  locationType: 'office' | 'online';
  onContinue: () => void;
}

export default function BookingSummaryCard({
  service,
  selectedDate,
  selectedSlot,
  locationType,
  onContinue
}: BookingSummaryCardProps) {
  const { language } = useLanguage();

  const t = {
    en: {
      title: 'Booking Details',
      service: 'Service',
      dateTime: 'Date & Time',
      location: 'Location',
      office: 'Birmingham Office',
      online: 'Online',
      continue: 'Continue',
      selectAll: 'Please select date and time to continue'
    },
    ar: {
      title: 'تفاصيل الحجز',
      service: 'الخدمة',
      dateTime: 'التاريخ والوقت',
      location: 'الموقع',
      office: 'مكتب برمنجهام',
      online: 'عبر الإنترنت',
      continue: 'متابعة',
      selectAll: 'الرجاء اختيار التاريخ والوقت للمتابعة'
    }
  }[language];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    if (language === 'ar') {
      return date.toLocaleDateString('ar-EG', options);
    }
    return date.toLocaleDateString('en-GB', options);
  };

  const isComplete = service && selectedDate && selectedSlot;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{t.title}</h3>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-medium">{t.service}</span>
          </div>
          <p className="text-gray-900 font-medium ps-10">
            {service ? (language === 'ar' ? service.name_ar : service.name_en) : '-'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium">{t.dateTime}</span>
          </div>
          <p className="text-gray-900 font-medium ps-10">
            {selectedDate && selectedSlot
              ? `${formatDate(selectedDate)}, ${formatTime(selectedSlot.startTime)}`
              : '-'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium">{t.location}</span>
          </div>
          <p className="text-gray-900 font-medium ps-10">
            {locationType === 'office' ? t.office : t.online}
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!isComplete}
        className={`
          w-full mt-8 py-4 rounded-xl font-semibold text-base transition-all
          ${isComplete
            ? 'bg-teal-600 text-white hover:bg-teal-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {t.continue}
      </button>

      {!isComplete && (
        <p className="text-center text-sm text-gray-400 mt-3">
          {t.selectAll}
        </p>
      )}
    </div>
  );
}