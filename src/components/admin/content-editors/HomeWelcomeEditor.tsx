import { HandHeart } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import ImageUploader from '../ImageUploader';
import { SectionEditorProps, useSectionHelper } from './types';

export default function HomeWelcomeEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
  pageImages,
  onPageImageChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);
  const welcomeImage = pageImages?.find((i) => i.image_key === 'welcome_section');

  const preview = (
    <div className="bg-sand p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-primary mb-1">
          {getEn('welcome_title') || 'Welcome to YCA Birmingham'}
        </h3>
        <div className="w-12 h-0.5 bg-accent mx-auto mb-2" />
        <p className="text-xs text-muted max-w-sm mx-auto">
          {getEn('welcome_description') || 'Description...'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="rounded-lg overflow-hidden bg-gray-200 aspect-video">
          {welcomeImage ? (
            <img src={welcomeImage.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Welcome Image
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">
            {getEn('mission_title') || 'Our Mission & Vision'}
          </h4>
          <p className="text-[10px] text-muted leading-relaxed mb-1 line-clamp-3">
            {getEn('mission_paragraph1') || 'Mission paragraph 1...'}
          </p>
          <p className="text-[10px] text-muted leading-relaxed mb-2 line-clamp-2">
            {getEn('mission_paragraph2') || 'Mission paragraph 2...'}
          </p>
          <span className="inline-block bg-primary text-white px-3 py-1 rounded text-[10px] font-semibold">
            {getEn('mission_button') || 'Learn More About Us'}
          </span>
        </div>
      </div>
    </div>
  );

  const editor = (
    <div className="space-y-3">
      {getId('welcome_title') && (
        <EditableField
          label="Welcome Title"
          valueEn={getEn('welcome_title')}
          valueAr={editedContentAr[getId('welcome_title')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('welcome_title'), v)}
          onChangeAr={(v) => onContentArChange(getId('welcome_title'), v)}
          compact
        />
      )}
      {getId('welcome_description') && (
        <EditableField
          label="Welcome Description"
          valueEn={getEn('welcome_description')}
          valueAr={editedContentAr[getId('welcome_description')] || ''}
          onChangeEn={(v) => onContentEnChange(getId('welcome_description'), v)}
          onChangeAr={(v) => onContentArChange(getId('welcome_description'), v)}
          multiline
          compact
        />
      )}
      {welcomeImage && onPageImageChange && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Welcome Image</p>
          <ImageUploader
            bucket="content-images"
            currentImage={welcomeImage.image_url}
            onUploadSuccess={(url) => onPageImageChange(welcomeImage.id, url)}
            label="Replace Image"
          />
        </div>
      )}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mission & Vision</p>
        <div className="space-y-3">
          {getId('mission_title') && (
            <EditableField
              label="Mission Title"
              valueEn={getEn('mission_title')}
              valueAr={editedContentAr[getId('mission_title')] || ''}
              onChangeEn={(v) => onContentEnChange(getId('mission_title'), v)}
              onChangeAr={(v) => onContentArChange(getId('mission_title'), v)}
              compact
            />
          )}
          {getId('mission_paragraph1') && (
            <EditableField
              label="Mission Paragraph 1"
              valueEn={getEn('mission_paragraph1')}
              valueAr={editedContentAr[getId('mission_paragraph1')] || ''}
              onChangeEn={(v) => onContentEnChange(getId('mission_paragraph1'), v)}
              onChangeAr={(v) => onContentArChange(getId('mission_paragraph1'), v)}
              multiline
              compact
            />
          )}
          {getId('mission_paragraph2') && (
            <EditableField
              label="Mission Paragraph 2"
              valueEn={getEn('mission_paragraph2')}
              valueAr={editedContentAr[getId('mission_paragraph2')] || ''}
              onChangeEn={(v) => onContentEnChange(getId('mission_paragraph2'), v)}
              onChangeAr={(v) => onContentArChange(getId('mission_paragraph2'), v)}
              multiline
              compact
            />
          )}
          {getId('mission_button') && (
            <EditableField
              label="Mission Button"
              valueEn={getEn('mission_button')}
              valueAr={editedContentAr[getId('mission_button')] || ''}
              onChangeEn={(v) => onContentEnChange(getId('mission_button'), v)}
              onChangeAr={(v) => onContentArChange(getId('mission_button'), v)}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <SectionWrapper
      title="Welcome & Mission"
      icon={<HandHeart size={16} />}
      preview={preview}
      editor={editor}
      defaultOpen
    />
  );
}
