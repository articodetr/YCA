import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';

interface Props {
  paymentHistory: any[];
  t: Record<string, string>;
}

export default function PaymentsTab({ paymentHistory, t }: Props) {
  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (paymentHistory.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-divider p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted font-medium">{t.noPayments}</p>
      </motion.div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid': case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { approved: t.approved, paid: t.paid, pending: t.pending, rejected: t.rejected };
    return map[status] || status;
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5 flex items-center justify-between">
        <span className="text-sm text-muted">{t.totalPaid}</span>
        <span className="text-2xl font-bold text-primary">£{totalPaid}</span>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider divide-y divide-divider">
        {paymentHistory.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">£{payment.amount}</p>
                <p className="text-xs text-muted">{new Date(payment.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusIcon(payment.status)}
              <span className="text-xs font-medium text-muted">{statusLabel(payment.status)}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
