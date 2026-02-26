import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Edit2, ExternalLink, FileText, Languages, Mail, Phone, Save, Scale, Trash2, User, X, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: { kind: 'translation' | 'other'; data: any } | null;
  onUpdate?: () => void;
}

export default function ServiceRequestDetailsModal({ isOpen, onClose, request, onUpdate }: Props) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const kind = request?.kind;
  const data = request?.data;

  const labels = useMemo(() => ({
    translationTitle: language === 'ar' ? 'طلب ترجمة' : 'Translation Request',
    otherTitle: language === 'ar' ? 'طلب قانوني / توثيق' : 'Legal / Documentation Request',
    status: language === 'ar' ? 'الحالة' : 'Status',
    edit: language === 'ar' ? 'تعديل' : 'Edit',
    save: language === 'ar' ? 'حفظ' : 'Save',
    cancelReq: language === 'ar' ? 'إلغاء الطلب' : 'Cancel Request',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    contact: language === 'ar' ? 'معلومات الاتصال' : 'Contact Information',
    details: language === 'ar' ? 'تفاصيل الطلب' : 'Request Details',
    fullName: language === 'ar' ? 'الاسم الكامل' : 'Full Name',
    phone: language === 'ar' ? 'رقم الهاتف' : 'Phone',
    email: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
    notes: language === 'ar' ? 'ملاحظات' : 'Notes',
    urgency: language === 'ar' ? 'الأولوية' : 'Urgency',
    description: language === 'ar' ? 'الوصف' : 'Description',
    docType: language === 'ar' ? 'نوع المستند' : 'Document Type',
    sourceLang: language === 'ar' ? 'لغة المصدر' : 'Source Language',
    targetLang: language === 'ar' ? 'لغة الهدف' : 'Target Language',
    file: language === 'ar' ? 'الملف المرفق' : 'Attached File',
    view: language === 'ar' ? 'عرض' : 'View',
    unsaved: language === 'ar' ? 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟' : 'You have unsaved changes. Do you want to continue?',
    confirmCancel: language === 'ar' ? 'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this request?',
    saved: language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully',
    cancelled: language === 'ar' ? 'تم إلغاء الطلب' : 'Request cancelled',
  }), [language]);

  const [form, setForm] = useState<any>({
    full_name: '',
    phone: '',
    email: '',
    notes: '',
    urgency: 'standard',
    description: '',
    document_type: '',
    source_language: '',
    target_language: '',
    file_url: '',
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      full_name: data.full_name || '',
      phone: data.phone || '',
      email: data.email || '',
      notes: data.notes || '',
      urgency: data.urgency || 'standard',
      description: data.description || '',
      document_type: data.document_type || '',
      source_language: data.source_language || '',
      target_language: data.target_language || '',
      file_url: data.file_url || '',
    });
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setError('');
    setSuccess('');
  }, [data]);

  const tableName = kind === 'translation' ? 'translation_requests' : 'other_legal_requests';

  const canEditOrCancel = (() => {
    if (!data) return false;
    const s = data.status;
    if (!s) return true;
    return !['completed', 'approved', 'rejected', 'cancelled', 'in_progress'].includes(s);
  })();

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!confirm(labels.unsaved)) return;
    }
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const updateField = (key: string, value: string) => {
    setForm((p: any) => ({ ...p, [key]: value }));
    setHasUnsavedChanges(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updateData: any = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
        urgency: form.urgency,
      };

      if (kind === 'translation') {
        updateData.document_type = form.document_type;
        updateData.source_language = form.source_language;
        updateData.target_language = form.target_language;
      } else {
        updateData.description = form.description;
      }

      const { error: updErr } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', data.id);

      if (updErr) throw updErr;
      setSuccess(labels.saved);
      setHasUnsavedChanges(false);
      setTimeout(() => {
        setIsEditMode(false);
        if (onUpdate) onUpdate();
      }, 800);
    } catch (e: any) {
      setError(e?.message || (language === 'ar' ? 'فشل في حفظ التغييرات' : 'Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!data) return;
    if (!confirm(labels.confirmCancel)) return;
    setIsCancelling(true);
    setError('');
    setSuccess('');
    try {
      const { error: updErr } = await supabase
        .from(tableName)
        .update({ status: 'cancelled' })
        .eq('id', data.id);
      if (updErr) throw updErr;
      setSuccess(labels.cancelled);
      setTimeout(() => {
        if (onUpdate) onUpdate();
        handleClose();
      }, 700);
    } catch (e: any) {
      setError(e?.message || (language === 'ar' ? 'فشل في الإلغاء' : 'Failed to cancel'));
    } finally {
      setIsCancelling(false);
    }
  };

  if (!request || !data) return null;

  const TitleIcon = kind === 'translation' ? Languages : Scale;
  const title = kind === 'translation' ? labels.translationTitle : labels.otherTitle;
  const statusText = (data.status || 'submitted').replace(/_/g, ' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-primary/5 to-sand">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TitleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-600">{data.booking_reference || ''}</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-9 h-9 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-emerald-700 font-medium">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{labels.status}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white border-gray-200 text-gray-700">
                      {data.status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {statusText}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    {labels.contact}
                    {!isEditMode && canEditOrCancel && (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {labels.edit}
                      </button>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        {labels.fullName}
                      </label>
                      {isEditMode ? (
                        <input
                          value={form.full_name}
                          onChange={(e) => updateField('full_name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium">{data.full_name || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        {labels.phone}
                      </label>
                      {isEditMode ? (
                        <input
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          dir="ltr"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium" dir="ltr">{data.phone || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        {labels.email}
                      </label>
                      {isEditMode ? (
                        <input
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          dir="ltr"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium" dir="ltr">{data.email || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{labels.details}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kind === 'translation' ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.docType}</label>
                          {isEditMode ? (
                            <input
                              value={form.document_type}
                              onChange={(e) => updateField('document_type', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          ) : (
                            <p className="text-base text-gray-900 font-medium">{data.document_type || '-'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.urgency}</label>
                          {isEditMode ? (
                            <select
                              value={form.urgency}
                              onChange={(e) => updateField('urgency', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                              <option value="standard">standard</option>
                              <option value="urgent">urgent</option>
                            </select>
                          ) : (
                            <p className="text-base text-gray-900 font-medium">{data.urgency || '-'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.sourceLang}</label>
                          {isEditMode ? (
                            <input
                              value={form.source_language}
                              onChange={(e) => updateField('source_language', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          ) : (
                            <p className="text-base text-gray-900 font-medium">{data.source_language || '-'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.targetLang}</label>
                          {isEditMode ? (
                            <input
                              value={form.target_language}
                              onChange={(e) => updateField('target_language', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          ) : (
                            <p className="text-base text-gray-900 font-medium">{data.target_language || '-'}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.urgency}</label>
                          {isEditMode ? (
                            <select
                              value={form.urgency}
                              onChange={(e) => updateField('urgency', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                              <option value="standard">standard</option>
                              <option value="urgent">urgent</option>
                            </select>
                          ) : (
                            <p className="text-base text-gray-900 font-medium">{data.urgency || '-'}</p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.description}</label>
                          {isEditMode ? (
                            <textarea
                              value={form.description}
                              onChange={(e) => updateField('description', e.target.value)}
                              rows={4}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          ) : (
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.description || data.notes || '-'}</p>
                          )}
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.notes}</label>
                      {isEditMode ? (
                        <textarea
                          value={form.notes}
                          onChange={(e) => updateField('notes', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.notes || '-'}</p>
                      )}
                    </div>

                    {data.file_url && (
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">{labels.file}</label>
                        <a
                          href={data.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          {labels.view}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 flex items-center justify-between gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  {labels.close}
                </button>

                <div className="flex items-center gap-2">
                  {canEditOrCancel && (
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling || isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      {labels.cancelReq}
                    </button>
                  )}

                  {isEditMode && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {isSaving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      {labels.save}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
