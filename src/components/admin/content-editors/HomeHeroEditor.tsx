import { Sparkles, ArrowRight } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

export default function HomeHeroEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);

  const preview = (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0a1628]/90 to-[#1a2a44] p-8 text-center">
      <p className="text-gray-300 text-xs mb-3 italic">
        (Hero slides are managed in Hero Management)
      </p>
      <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
        {getEn('hero_subtitle') || 'Hero subtitle text...'}
      </p>
      <div className="flex justify-center gap-3">
        <span className="inline-flex items-center gap-1 bg-accent text-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          {getEn('hero_button_services') || 'Discover Our Services'} <ArrowRight size={12} />
        </span>
        <span className="inline-flex items-center gap-1 border border-white text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          {getEn('hero_button_contact') || 'Get In Touch'}
        </span>
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('hero_subtitle') && (
        <EditableField
          label="Hero Subtitle"
          valueEn={getEn('hero_subtitle')}
          valueAr={editedContentAr[getId('hero_subtitle')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('hero_subtitle'), v)}
          onChangeAr={(v) => onContentArChange(getId('hero_subtitle'), v)}
          multiline
          compact
        />
      )}
      {getId('hero_button_services') && (
        <EditableField
          label="Services Button"
          valueEn={getEn('hero_button_services')}
          valueAr={editedContentAr[getId('hero_button_services')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('hero_button_services'), v)}
          onChangeAr={(v) => onContentArChange(getId('hero_button_services'), v)}
          compact
        />
      )}
      {getId('hero_button_contact') && (
        <EditableField
          label="Contact Button"
          valueEn={getEn('hero_button_contact')}
          valueAr={editedContentAr[getId('hero_button_contact')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('hero_button_contact'), v)}
          onChangeAr={(v) => onContentArChange(getId('hero_button_contact'), v)}
          compact
        />
      )}
    </div>
  );

  return (
    <SectionWrapper
      title="Hero Section"
      icon={<Sparkles size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
