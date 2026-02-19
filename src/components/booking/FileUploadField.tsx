import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  multiple?: boolean;
  userId?: string;
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
}

export default function FileUploadField({
  label,
  required = false,
  multiple = false,
  userId,
  onUploadComplete,
  existingUrls = [],
}: FileUploadFieldProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>(
    existingUrls.map(url => ({ name: url.split('/').pop() || '', url }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = language === 'ar' ? {
    dropOrClick: 'اسحب الملف هنا أو اضغط للاختيار',
    maxSize: 'الحد الأقصى: 5 ميجابايت | صور أو PDF',
    uploading: 'جاري الرفع...',
    uploaded: 'تم الرفع',
    remove: 'إزالة',
    invalidType: 'نوع الملف غير مدعوم. يرجى رفع صورة أو ملف PDF',
    tooLarge: 'حجم الملف يتجاوز 5 ميجابايت',
    uploadError: 'فشل رفع الملف. يرجى المحاولة مرة أخرى',
  } : {
    dropOrClick: 'Drop file here or click to browse',
    maxSize: 'Max 5MB | Images or PDF',
    uploading: 'Uploading...',
    uploaded: 'Uploaded',
    remove: 'Remove',
    invalidType: 'Invalid file type. Please upload an image or PDF',
    tooLarge: 'File size exceeds 5MB limit',
    uploadError: 'Failed to upload file. Please try again',
  };

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const handleFiles = async (files: FileList) => {
    if (!multiple && uploadedFiles.length >= 1) {
      return;
    }

    setError('');
    const filesToProcess = multiple ? Array.from(files) : [files[0]];

    for (const file of filesToProcess) {
      if (!acceptedTypes.includes(file.type)) {
        setError(t.invalidType);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t.tooLarge);
        return;
      }
    }

    setUploading(true);
    try {
      const newFiles: { name: string; url: string }[] = [];

      for (const file of filesToProcess) {
        const ext = file.name.split('.').pop();
        const folder = userId || 'anonymous';
        const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('wakala-documents')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('wakala-documents')
          .getPublicUrl(path);

        newFiles.push({ name: file.name, url: urlData.publicUrl });
      }

      const updated = multiple ? [...uploadedFiles, ...newFiles] : newFiles;
      setUploadedFiles(updated);
      onUploadComplete(updated.map(f => f.url));
    } catch {
      setError(t.uploadError);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    onUploadComplete(updated.map(f => f.url));
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|webp)$/i.test(name);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {uploadedFiles.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md p-2">
              {isImage(file.name) ? (
                <Image className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                title={t.remove}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(multiple || uploadedFiles.length === 0) && (
        <div
          className={`relative border-2 border-dashed rounded-md p-3 transition-all cursor-pointer ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            onChange={e => e.target.files?.length && handleFiles(e.target.files)}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-blue-600">{t.uploading}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 flex-wrap`}>
                <p className="text-sm font-medium text-gray-700">{t.dropOrClick}</p>
                <span className="text-gray-400">•</span>
                <p className="text-xs text-gray-500">{t.maxSize}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
