import { useState, useEffect } from 'react';
import { X, Loader2, Save, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import FileUploadField from '../booking/FileUploadField';

interface EditWakalaModalProps {
  application: any;
  onClose: () => void;
  onSuccess: () => void;
}

const translationsData = {
  en: {
    title: 'Edit Wakala Application',
    subtitle: 'Update your wakala application details',
    wakalaDetails: 'Wakala Details',
    applicantName: 'Applicant Name (Al-Muwakkil)',
    agentName: 'Agent Name (Al-Wakeel)',
    wakalaType: 'Wakala Type',
    wakalaFormat: 'Wakala Format',
    selectWakalaType: 'Select wakala type',
    selectWakalaFormat: 'Select wakala format',
    wakalaTypes: {
      general: 'General Power of Attorney',
      specific: 'Specific Power of Attorney',
      property: 'Property Power of Attorney',
      legal: 'Legal Representation',
      financial: 'Financial Power of Attorney',
    } as Record<string, string>,
    wakalaFormats: {
      standard: 'Standard Format',
      notarized: 'Notarized Format',
      apostille: 'With Apostille',
    } as Record<string, string>,
    documents: 'Documents',
    applicantPassport: 'Applicant Passport Copy',
    attorneyPassport: 'Attorney Passport Copy',
    witnessPassports: 'Witness Passports (Optional)',
    specialRequests: 'Additional Notes (Optional)',
    cancel: 'Cancel',
    save: 'Save Changes',
    saving: 'Saving...',
    errorMessage: 'Failed to update application. Please try again.',
    fillAllFields: 'Please fill all required fields',
    successMessage: 'Application updated successfully',
    cannotEdit: 'This application cannot be edited',
    cannotEditDesc: 'You can only edit applications in pending, submitted, or pending_payment status.',
  },
  ar: {
    title: 'تعديل طلب الوكالة',
    subtitle: 'تحديث تفاصيل طلب الوكالة',
    wakalaDetails: 'تفاصيل الوكالة',
    applicantName: 'اسم الموكّل',
    agentName: 'اسم الوكيل',
    wakalaType: 'نوع الوكالة',
    wakalaFormat: 'صيغة الوكالة',
    selectWakalaType: 'اختر نوع الوكالة',
    selectWakalaFormat: 'اختر صيغة الوكالة',
    wakalaTypes: {
      general: 'توكيل عام',
      specific: 'توكيل خاص',
      property: 'توكيل عقاري',
      legal: 'توكيل قضائي',
      financial: 'توكيل مالي',
    } as Record<string, string>,
    wakalaFormats: {
      standard: 'الصيغة العادية',
      notarized: 'الصيغة الموثقة',
      apostille: 'مع أبوستيل',
    } as Record<string, string>,
    documents: 'المستندات',
    applicantPassport: 'جواز سفر الموكّل',
    attorneyPassport: 'جواز سفر الوكيل',
    witnessPassports: 'جوازات الشهود (اختياري)',
    specialRequests: 'ملاحظات إضافية (اختياري)',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    saving: 'جاري الحفظ...',
    errorMessage: 'فشل تحديث الطلب. يرجى المحاولة مرة أخرى.',
    fillAllFields: 'يرجى تعبئة جميع الحقول المطلوبة',
    successMessage: 'تم تحديث الطلب بنجاح',
    cannotEdit: 'لا يمكن تعديل هذا الطلب',
    cannotEditDesc: 'يمكنك فقط تعديل الطلبات في حالة قيد الانتظار أو المقدمة أو انتظار الدفع.',
  },
};

export default function EditWakalaModal({ application, onClose, onSuccess }: EditWakalaModalProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translationsData[language];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canEdit = ['pending', 'submitted', 'pending_payment'].includes(application.status);

  const [formData, setFormData] = useState({
    applicantName: application.applicant_name || '',
    agentName: application.agent_name || '',
    wakalaType: application.wakala_type || '',
    wakalaFormat: application.wakala_format || '',
    specialRequests: application.special_requests || '',
  });

  const [applicantPassportUrls, setApplicantPassportUrls] = useState<string[]>(
    application.applicant_passport_url ? [application.applicant_passport_url] : []
  );
  const [attorneyPassportUrls, setAttorneyPassportUrls] = useState<string[]>(
    application.attorney_passport_url ? [application.attorney_passport_url] : []
  );
  const [witnessPassportUrls, setWitnessPassportUrls] = useState<string[]>(
    application.witness_passports_url ? application.witness_passports_url.split(',').filter(Boolean) : []
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setError('');

    if (!formData.applicantName || !formData.agentName || !formData.wakalaType || !formData.wakalaFormat) {
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const updates: any = {
        applicant_name: formData.applicantName,
        agent_name: formData.agentName,
        wakala_type: formData.wakalaType,
        wakala_format: formData.wakalaFormat,
        special_requests: formData.specialRequests,
        updated_at: new Date().toISOString(),
      };

      if (applicantPassportUrls.length > 0) {
        updates.applicant_passport_url = applicantPassportUrls[0];
      }
      if (attorneyPassportUrls.length > 0) {
        updates.attorney_passport_url = attorneyPassportUrls[0];
      }
      if (witnessPassportUrls.length > 0) {
        updates.witness_passports_url = witnessPassportUrls.join(',');
      }

      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update(updates)
        .eq('id', application.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t.cannotEdit}</h3>
              <p className="text-sm text-gray-600">{t.cannotEditDesc}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
            <p className="text-emerald-100 text-sm mt-0.5">{t.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-md font-bold text-gray-900 mb-4">{t.wakalaDetails}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.applicantName} *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => setFormData((p) => ({ ...p, applicantName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.agentName} *
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData((p) => ({ ...p, agentName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.wakalaType} *
                </label>
                <select
                  value={formData.wakalaType}
                  onChange={(e) => setFormData((p) => ({ ...p, wakalaType: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                  required
                  disabled={loading}
                >
                  <option value="">{t.selectWakalaType}</option>
                  {Object.entries(t.wakalaTypes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.wakalaFormat} *
                </label>
                <select
                  value={formData.wakalaFormat}
                  onChange={(e) => setFormData((p) => ({ ...p, wakalaFormat: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                  required
                  disabled={loading}
                >
                  <option value="">{t.selectWakalaFormat}</option>
                  {Object.entries(t.wakalaFormats).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-gray-700" />
              <h3 className="text-md font-bold text-gray-900">{t.documents}</h3>
            </div>
            <div className="space-y-4">
              <FileUploadField
                label={t.applicantPassport}
                required
                userId={application.user_id}
                onUploadComplete={setApplicantPassportUrls}
                existingUrls={applicantPassportUrls}
              />
              <FileUploadField
                label={t.attorneyPassport}
                required
                userId={application.user_id}
                onUploadComplete={setAttorneyPassportUrls}
                existingUrls={attorneyPassportUrls}
              />
              <FileUploadField
                label={t.witnessPassports}
                multiple
                userId={application.user_id}
                onUploadComplete={setWitnessPassportUrls}
                existingUrls={witnessPassportUrls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.specialRequests}
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData((p) => ({ ...p, specialRequests: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
