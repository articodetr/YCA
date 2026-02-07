import { FileText, Image as ImageIcon, X } from 'lucide-react';
import EditableField from './EditableField';
import ImageUploader from '../ImageUploader';
import { ContentSection } from './types';

interface GenericPageEditorProps {
  sections: ContentSection[];
  editedContentEn: Record<string, string>;
  editedContentAr: Record<string, string>;
  editedImages: Record<string, string>;
  onContentEnChange: (id: string, value: string) => void;
  onContentArChange: (id: string, value: string) => void;
  onImageChange: (id: string, url: string) => void;
  onImageRemove: (id: string) => void;
  onToggleActive: (section: ContentSection, checked: boolean) => void;
}

function groupSections(sections: ContentSection[]) {
  const groups: Record<string, ContentSection[]> = {};
  sections.forEach((s) => {
    const parts = s.section_key.split('_');
    let prefix = parts[0];
    if (parts.length > 2) {
      prefix = parts.slice(0, -1).join('_');
    }
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(s);
  });
  return groups;
}

function formatGroupName(key: string) {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getFieldType(key: string): 'title' | 'description' | 'button' | 'text' {
  if (key.includes('title') || key.includes('heading')) return 'title';
  if (key.includes('description') || key.includes('paragraph') || key.includes('text') || key.includes('intro'))
    return 'description';
  if (key.includes('button') || key.includes('cta') || key.includes('link')) return 'button';
  return 'text';
}

export default function GenericPageEditor({
  sections,
  editedContentEn,
  editedContentAr,
  editedImages,
  onContentEnChange,
  onContentArChange,
  onImageChange,
  onImageRemove,
  onToggleActive,
}: GenericPageEditorProps) {
  const groups = groupSections(sections);

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-muted">No content sections found for this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupName, groupSections]) => (
        <div key={groupName} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-primary">{formatGroupName(groupName)}</h3>
          </div>

          <div className="p-6">
            <div className="rounded-lg border border-gray-100 bg-sand/30 p-5 mb-6">
              {groupSections.map((section) => {
                const fieldType = getFieldType(section.section_key);
                const enValue = editedContentEn[section.id] || '';
                return (
                  <div key={section.id} className="mb-2 last:mb-0">
                    {fieldType === 'title' && (
                      <h4 className="text-base font-bold text-primary">{enValue || 'Title...'}</h4>
                    )}
                    {fieldType === 'description' && (
                      <p className="text-sm text-muted leading-relaxed">{enValue || 'Description...'}</p>
                    )}
                    {fieldType === 'button' && (
                      <span className="inline-block bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold mt-1">
                        {enValue || 'Button'}
                      </span>
                    )}
                    {fieldType === 'text' && (
                      <p className="text-sm text-gray-700">{enValue || 'Text...'}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {groupSections.map((section) => {
                const fieldType = getFieldType(section.section_key);
                const shortLabel = section.section_key
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');

                return (
                  <div key={section.id} className="space-y-2 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <EditableField
                      label={shortLabel}
                      valueEn={editedContentEn[section.id] || ''}
                      valueAr={editedContentAr[section.id] || ''}
                      onChangeEn={(v) => onContentEnChange(section.id, v)}
                      onChangeAr={(v) => onContentArChange(section.id, v)}
                      multiline={fieldType === 'description' || fieldType === 'text'}
                    />

                    {editedImages[section.id] && (
                      <div className="relative inline-block">
                        <img
                          src={editedImages[section.id]}
                          alt=""
                          className="max-h-24 rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => onImageRemove(section.id)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    {section.content?.image !== undefined && (
                      <div className="mt-1">
                        <ImageUploader
                          bucket="content-images"
                          currentImage={editedImages[section.id] || null}
                          onUploadSuccess={(url) => onImageChange(section.id, url)}
                          label="Image"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.is_active}
                        onChange={(e) => onToggleActive(section, e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-muted">Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
