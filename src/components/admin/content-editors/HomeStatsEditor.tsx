import { BarChart3, Users, GraduationCap, Trophy, Heart } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import EditableField from './EditableField';
import { SectionEditorProps, useSectionHelper } from './types';

const statIcons = [
  { key: 'stats_members_label', icon: Users, value: '850+' },
  { key: 'stats_programmes_label', icon: GraduationCap, value: '5' },
  { key: 'stats_years_label', icon: Trophy, value: '30+' },
  { key: 'stats_impact_label', icon: Heart, value: '1000+' },
];

export default function HomeStatsEditor({
  sections,
  editedContentEn,
  editedContentAr,
  onContentEnChange,
  onContentArChange,
}: SectionEditorProps) {
  const { getId, getEn } = useSectionHelper(sections, editedContentEn, editedContentAr);

  const preview = (
    <div className="bg-white p-6">
      <div className="grid grid-cols-4 gap-4">
        {statIcons.map(({ key, icon: Icon, value }) => (
          <div key={key} className="text-center">
            <Icon size={20} className="text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted">{getEn(key) || key}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const editor = (
    <div className="grid grid-cols-2 gap-3">
      {statIcons.map(({ key }) => {
        const id = getId(key);
        if (!id) return null;
        return (
          <EditableField
            key={key}
            label={key.replace('stats_', '').replace('_label', '')}
            valueEn={getEn(key)}
            valueAr={editedContentAr[id] || ''}
            onChangeEn={(v) => onContentEnChange(id, v)}
            onChangeAr={(v) => onContentArChange(id, v)}
            compact
          />
        );
      })}
    </div>
  );

  return (
    <SectionWrapper
      title="Statistics"
      icon={<BarChart3 size={16} />}
      preview={preview}
      editor={editor}
    />
  );
}
