import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, Clock, Settings } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMemberAuth } from '../../../contexts/MemberAuthContext';

interface Props {
  notifications: any[];
  onRefresh: () => void;
  t: Record<string, string>;
}

const typeConfig: Record<string, { icon: typeof Info; bg: string; text: string }> = {
  info: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-600' },
  success: { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600' },
  reminder: { icon: Clock, bg: 'bg-sky-50', text: 'text-sky-600' },
  system: { icon: Settings, bg: 'bg-gray-100', text: 'text-gray-600' },
};

function formatTimeAgo(dateStr: string, language: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === 'ar') {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-GB');
  }

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB');
}

export default function NotificationsTab({ notifications, onRefresh, t }: Props) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      onRefresh();
    } catch (err) {
      console.error('Error marking notifications:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      onRefresh();
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  if (notifications.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-divider p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted font-medium">{t.noNotifications}</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {unreadCount > 0 && (
        <motion.div variants={staggerItem} className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary font-medium transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {t.markAllRead}
          </button>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider divide-y divide-divider overflow-hidden">
        {notifications.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig.info;
          const Icon = config.icon;
          const title = language === 'ar' ? (notif.title_ar || notif.title) : notif.title;
          const message = language === 'ar' ? (notif.message_ar || notif.message) : notif.message;

          return (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50 ${
                !notif.is_read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium text-primary ${!notif.is_read ? 'font-bold' : ''}`}>
                    {title}
                  </p>
                  <span className="text-xs text-muted whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(notif.created_at, language)}
                  </span>
                </div>
                <p className="text-sm text-muted mt-0.5 line-clamp-2">{message}</p>
              </div>
              {!notif.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
