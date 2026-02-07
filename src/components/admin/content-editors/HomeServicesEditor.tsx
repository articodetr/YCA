import { Briefcase, FileText, Users, Building } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

const serviceCards = [
  { titleKey: 'service_advice_title', descKey: 'service_advice_description', icon: FileText },
  { titleKey: 'service_programmes_title', descKey: 'service_programmes_description', icon: Users },
  { titleKey: 'service_hub_title', descKey: 'service_hub_description', icon: Building },
];

export default function HomeServicesEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);

  const preview = (
    <div className="bg-white p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-primary mb-1">
          {getEn('services_section_title') || 'Our Services'}
        </h3>
        <div className="w-12 h-0.5 bg-accent mx-auto mb-2" />
        <p className="text-xs text-muted max-w-sm mx-auto">
          {getEn('services_section_description') || 'Description...'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {serviceCards.map(({ titleKey, descKey, icon: Icon }) => (
          <div key={titleKey} className="bg-sand p-4 rounded-lg">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center mb-2">
              <Icon size={14} className="text-primary" />
            </div>
            <h4 className="text-xs font-bold text-primary mb-1">
              {getEn(titleKey) || 'Service Title'}
            </h4>
            <p className="text-[10px] text-muted line-clamp-3 leading-relaxed">
              {getEn(descKey) || 'Service description...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('services_section_title') && (
        <EditableField
          label="Section Title"
          valueEn={getEn('services_section_title')}
          valueAr={editedContentAr[getId('services_section_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('services_section_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('services_section_title'), v)}
          compact
        />
      )}
      {getId('services_section_description') && (
        <EditableField
          label="Section Description"
          valueEn={getEn('services_section_description')}
          valueAr={editedContentAr[getId('services_section_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('services_section_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('services_section_description'), v)}
          multiline
          compact
        />
      )}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Service Cards</p>
        <div className="space-y-4">
          {serviceCards.map(({ titleKey, descKey, icon: Icon }) => (
            <div key={titleKey} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {getEn(titleKey) || 'Service'}
                </span>
              </div>
              {getId(titleKey) && (
                <EditableField
                  label="Title"
                  valueEn={getEn(titleKey)}
                  valueAr={editedContentAr[getId(titleKey)] || ''}
                  onChangeEn={(v) => onContentEnChange(getId(titleKey), v)}
                  onChangeAr={(v) => onContentArChange(getId(titleKey), v)}
                  compact
                />
              )}
              {getId(descKey) && (
                <EditableField
                  label="Description"
                  valueEn={getEn(descKey)}
                  valueAr={editedContentAr[getId(descKey)] || ''}
                  onChangeEn={(v) => onContentEnChange(getId(descKey), v)}
                  onChangeAr={(v) => onContentArChange(getId(descKey), v)}
                  multiline
                  compact
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <SectionWrapper
      title="Our Services"
      icon={<Briefcase size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
