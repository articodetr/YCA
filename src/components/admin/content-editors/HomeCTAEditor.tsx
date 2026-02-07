import { Megaphone } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

export default function HomeCTAEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);

  const preview = (
    <div className="bg-accent p-6 text-center">
      <h3 className="text-lg font-bold text-primary mb-2">
        {getEn('cta_title') || 'Need Help or Have Questions?'}
      </h3>
      <p className="text-xs text-secondary mb-3 max-w-sm mx-auto">
        {getEn('cta_description') || 'Description...'}
      </p>
      <span className="inline-block bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold">
        {getEn('cta_button') || 'Contact Us Today'}
      </span>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('cta_title') && (
        <EditableField
          label="CTA Title"
          valueEn={getEn('cta_title')}
          valueAr={editedContentAr[getId('cta_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('cta_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('cta_title'), v)}
          compact
        />
      )}
      {getId('cta_description') && (
        <EditableField
          label="CTA Description"
          valueEn={getEn('cta_description')}
          valueAr={editedContentAr[getId('cta_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('cta_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('cta_description'), v)}
          multiline
          compact
        />
      )}
      {getId('cta_button') && (
        <EditableField
          label="CTA Button"
          valueEn={getEn('cta_button')}
          valueAr={editedContentAr[getId('cta_button')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('cta_button'), v)}
          onChangeAr={(v) => onContentArChange(getId('cta_button'), v)}
          compact
        />
      )}
    </div>
  );

  return (
    <SectionWrapper
      title="Call to Action"
      icon={<Megaphone size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
