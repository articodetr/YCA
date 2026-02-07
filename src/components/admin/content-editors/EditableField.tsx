import { useState } from 'react';
import { Globe, Type } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  valueEn: string;
  valueAr: string;
  onChangeEn: (val: string) => void;
  onChangeAr: (val: string) => void;
  multiline?: boolean;
  compact?: boolean;
}

export default function EditableField({
  label,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  multiline = false,
  compact = false,
}: EditableFieldProps) {
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Type size={12} />
          {label}
        </label>
        <div className="flex bg-gray-100 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              activeLang === 'en'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Globe size={10} />
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('ar')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              activeLang === 'ar'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Globe size={10} />
            AR
          </button>
        </div>
      </div>

      {multiline ? (
        <textarea
          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          value={activeLang === 'en' ? valueEn : valueAr}
          onChange={(e) =>
            activeLang === 'en'
              ? onChangeEn(e.target.value)
              : onChangeAr(e.target.value)
          }
          rows={compact ? 2 : 3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none bg-white transition-all"
          placeholder={activeLang === 'en' ? 'English text...' : 'Arabic text...'}
        />
      ) : (
        <input
          type="text"
          dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          value={activeLang === 'en' ? valueEn : valueAr}
          onChange={(e) =>
            activeLang === 'en'
              ? onChangeEn(e.target.value)
              : onChangeAr(e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all"
          placeholder={activeLang === 'en' ? 'English text...' : 'Arabic text...'}
        />
      )}
    </div>
  );
}
