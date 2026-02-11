import { Calendar, ArrowRight } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

export default function HomeEventsEditor({
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
        <h3 className="text-base font-bold text-primary mb-1">
          {getEn('events_title') || 'Upcoming Events'}
        </h3>
        <div className="w-10 h-0.5 bg-[#8B4513] mx-auto mb-2" />
        <p className="text-[10px] text-muted max-w-xs mx-auto">
          {getEn('events_description') || 'Join us at our upcoming community events and celebrations'}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
            <div className="h-12 bg-gray-200 flex items-center justify-center">
              <Calendar size={12} className="text-gray-400" />
            </div>
            <div className="p-2">
              <div className="h-1.5 bg-[#8B4513]/20 rounded w-3/4 mb-1" />
              <div className="h-1 bg-gray-200 rounded w-full mb-0.5" />
              <div className="h-1 bg-gray-200 rounded w-2/3" />
              <div className="flex items-center gap-0.5 mt-1.5 text-[#8B4513]">
                <span className="text-[7px] font-semibold">Read More</span>
                <ArrowRight size={6} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-gray-400 text-center mt-3 italic">
        Event cards are populated from the Events table (managed in Events Management)
      </p>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('events_title') && (
        <EditableField
          label="Section Title"
          valueEn={getEn('events_title')}
          valueAr={editedContentAr[getId('events_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('events_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('events_title'), v)}
          compact
        />
      )}
      {getId('events_description') && (
        <EditableField
          label="Section Description"
          valueEn={getEn('events_description')}
          valueAr={editedContentAr[getId('events_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('events_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('events_description'), v)}
          multiline
          compact
        />
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          The event cards displayed on the Home page are automatically populated from the upcoming events in your Events Management page. Only the section title and description above are editable here.
        </p>
      </div>
    </div>
  );

  return (
    <SectionWrapper
      title="Upcoming Events"
      icon={<Calendar size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
