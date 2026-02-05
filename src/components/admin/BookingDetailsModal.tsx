import { X, Calendar, Clock, Mail, Phone, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BookingDetails {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  email: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service_name_en?: string;
  service_name_ar?: string;
  created_at: string;
}

interface BookingDetailsModalProps {
  booking: BookingDetails | null;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const { language } = useLanguage();

  if (!booking) return null;

  const t = {
    en: {
      title: 'Booking Details',
      applicantName: 'Applicant Name',
      email: 'Email',
      phone: 'Phone Number',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      notes: 'Notes',
      createdAt: 'Created At',
      close: 'Close',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
    ar: {
      title: 'تفاصيل الحجز',
      applicantName: 'اسم المتقدم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      service: 'الخدمة',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      notes: 'ملاحظات',
      createdAt: 'تاريخ الإنشاء',
      close: 'إغلاق',
      confirmed: 'مؤكد',
      pending: 'قيد الانتظار',
      cancelled: 'ملغي',
      completed: 'مكتمل',
    },
  }[language];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.applicantName}</span>
              </div>
              <p className="text-gray-900 font-medium">
                {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.email}</span>
              </div>
              <p className="text-gray-900 font-medium break-all">{booking.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.phone}</span>
              </div>
              <p className="text-gray-900 font-medium" dir="ltr">{booking.phone}</p>
            </div>

            {booking.service_name_en && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">{t.service}</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {language === 'ar' ? booking.service_name_ar : booking.service_name_en}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{t.date}</span>
            </div>
            <p className="text-blue-900 font-semibold text-lg">{formatDate(booking.date)}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">{t.time}</span>
            </div>
            <p className="text-green-900 font-semibold text-lg" dir="ltr">
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </p>
          </div>

          <div className={`rounded-lg p-4 border ${getStatusColor(booking.status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(booking.status)}
              <span className="text-sm font-medium">{t.status}</span>
              <span className="ml-auto font-bold">{t[booking.status.toLowerCase() as keyof typeof t] || booking.status}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.notes}</span>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            {t.createdAt}: {new Date(booking.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-GB')}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
