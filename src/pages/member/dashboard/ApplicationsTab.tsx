import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatTimeRange } from '../../../lib/booking-utils';

interface Props {
  wakalaApps: any[];
  onCancelAppointment: (app: any) => void;
  t: Record<string, string>;
}

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const config: Record<string, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
    approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, label: t.approved },
    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock, label: t.pending },
    rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle, label: t.rejected },
    cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle, label: t.cancelled },
  };
  const c = config[status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', icon: Clock, label: status };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

export default function ApplicationsTab({ wakalaApps, onCancelAppointment, t }: Props) {
  if (wakalaApps.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-divider p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted font-medium">{t.noWakala}</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {wakalaApps.map((app) => {
        const isCancelled = app.status === 'cancelled' || app.cancelled_at;
        const isPastAppointment = app.booking_date && new Date(app.booking_date) < new Date();
        const canCancel = app.booking_date && !isCancelled && !isPastAppointment;

        return (
          <motion.div
            key={app.id}
            variants={staggerItem}
            className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
              isCancelled ? 'border-red-200 bg-red-50/30' : 'border-divider'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-base font-bold text-primary">{app.service_type}</h4>
                  <StatusBadge status={isCancelled ? 'cancelled' : app.status} t={t} />
                </div>

                {app.booking_date && app.start_time && app.end_time && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.booking_date).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatTimeRange(app.start_time, app.end_time)}
                      {app.duration_minutes && (
                        <span className="text-xs font-medium text-primary/60">
                          ({app.duration_minutes} {t.minutes})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {isCancelled && app.cancelled_at && (
                  <p className="text-xs text-red-500 mt-2">
                    {t.cancelled} - {new Date(app.cancelled_at).toLocaleString()}
                  </p>
                )}
              </div>

              {canCancel && (
                <button
                  onClick={() => onCancelAppointment(app)}
                  className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex-shrink-0"
                >
                  {t.cancelAppointment}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
