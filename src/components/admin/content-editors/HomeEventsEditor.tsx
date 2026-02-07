import { Calendar } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import ImageUploader from '../ImageUploader';
import { SectionEditorProps, useSectionHelper } from './types';

export default function HomeEventsEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
  pageImages,
  onPageImageChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);
  const eventImage1 = pageImages?.find((i) => i.image_key === 'events_1');
  const eventImage2 = pageImages?.find((i) => i.image_key === 'events_2');

  const preview = (
    <div className="bg-primary p-6">
      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <h3 className="text-base font-bold text-white mb-2">
            {getEn('events_title') || 'Upcoming Events'}
          </h3>
          <p className="text-[10px] text-gray-300 leading-relaxed mb-3 line-clamp-3">
            {getEn('events_description') || 'Events description...'}
          </p>
          <span className="inline-flex items-center gap-1 bg-accent text-primary px-3 py-1.5 rounded text-[10px] font-semibold">
            <Calendar size={10} />
            {getEn('events_button') || 'View All Events'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg overflow-hidden bg-gray-700 aspect-square">
            {eventImage1 ? (
              <img src={eventImage1.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">Image 1</div>
            )}
          </div>
          <div className="rounded-lg overflow-hidden bg-gray-700 aspect-square mt-4">
            {eventImage2 ? (
              <img src={eventImage2.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">Image 2</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('events_title') && (
        <EditableField
          label="Events Title"
          valueEn={getEn('events_title')}
          valueAr={editedContentAr[getId('events_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('events_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('events_title'), v)}
          compact
        />
      )}
      {getId('events_description') && (
        <EditableField
          label="Events Description"
          valueEn={getEn('events_description')}
          valueAr={editedContentAr[getId('events_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('events_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('events_description'), v)}
          multiline
          compact
        />
      )}
      {getId('events_button') && (
        <EditableField
          label="Events Button"
          valueEn={getEn('events_button')}
          valueAr={editedContentAr[getId('events_button')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('events_button'), v)}
          onChangeAr={(v) => onContentArChange(getId('events_button'), v)}
          compact
        />
      )}
      {onPageImageChange && (eventImage1 || eventImage2) && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Event Images</p>
          <div className="grid grid-cols-2 gap-4">
            {eventImage1 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Image 1</p>
                <ImageUploader
                  bucket="content-images"
                  currentImage={eventImage1.image_url}
                  onUploadSuccess={(url) => onPageImageChange(eventImage1.id, url)}
                  label="Replace"
                />
              </div>
            )}
            {eventImage2 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Image 2</p>
                <ImageUploader
                  bucket="content-images"
                  currentImage={eventImage2.image_url}
                  onUploadSuccess={(url) => onPageImageChange(eventImage2.id, url)}
                  label="Replace"
                />
              </div>
            )}
          </div>
        </div>
      )}
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
