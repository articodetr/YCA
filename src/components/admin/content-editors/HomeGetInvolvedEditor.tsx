import { Heart, Users, HandHeart, Building } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

const cards = [
  { titleKey: 'get_involved_membership_title', descKey: 'get_involved_membership_desc', icon: Users },
  { titleKey: 'get_involved_volunteer_title', descKey: 'get_involved_volunteer_desc', icon: HandHeart },
  { titleKey: 'get_involved_donate_title', descKey: 'get_involved_donate_desc', icon: Heart },
  { titleKey: 'get_involved_partner_title', descKey: 'get_involved_partner_desc', icon: Building },
];

export default function HomeGetInvolvedEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);

  const preview = (
    <div className="bg-sand p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-primary mb-1">
          {getEn('get_involved_title') || 'Get Involved'}
        </h3>
        <div className="w-12 h-0.5 bg-accent mx-auto mb-2" />
        <p className="text-xs text-muted max-w-sm mx-auto">
          {getEn('get_involved_description') || 'Description...'}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(({ titleKey, descKey, icon: Icon }) => (
          <div key={titleKey} className="bg-white p-3 rounded-lg text-center">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon size={14} className="text-primary" />
            </div>
            <h4 className="text-[10px] font-bold text-primary mb-0.5">
              {getEn(titleKey) || 'Title'}
            </h4>
            <p className="text-[9px] text-muted">{getEn(descKey) || 'Description'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('get_involved_title') && (
        <EditableField
          label="Section Title"
          valueEn={getEn('get_involved_title')}
          valueAr={editedContentAr[getId('get_involved_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('get_involved_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('get_involved_title'), v)}
          compact
        />
      )}
      {getId('get_involved_description') && (
        <EditableField
          label="Section Description"
          valueEn={getEn('get_involved_description')}
          valueAr={editedContentAr[getId('get_involved_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('get_involved_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('get_involved_description'), v)}
          multiline
          compact
        />
      )}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cards</p>
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ titleKey, descKey, icon: Icon }) => (
            <div key={titleKey} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {getEn(titleKey) || 'Card'}
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
      title="Get Involved"
      icon={<Heart size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
