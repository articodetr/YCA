import { SectionEditorProps } from './types';
import HomeHeroEditor from './HomeHeroEditor';
import HomeStatsEditor from './HomeStatsEditor';
import HomeWelcomeEditor from './HomeWelcomeEditor';
import HomeServicesEditor from './HomeServicesEditor';
import HomeEventsEditor from './HomeEventsEditor';
import HomeGetInvolvedEditor from './HomeGetInvolvedEditor';
import HomeCTAEditor from './HomeCTAEditor';

export default function HomePageEditor(props: SectionEditorProps) {
  return (
    <div className="space-y-4">
      <HomeHeroEditor {...props} />
      <HomeWelcomeEditor {...props} />
      <HomeStatsEditor {...props} />
      <HomeServicesEditor {...props} />
      <HomeEventsEditor {...props} />
      <HomeGetInvolvedEditor {...props} />
      <HomeCTAEditor {...props} />
    </div>
  );
}
