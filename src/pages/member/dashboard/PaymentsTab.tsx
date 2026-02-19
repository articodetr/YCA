import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Clock, XCircle, Gift, Users, Briefcase, Calendar, Languages, Scale } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import type { PaymentItem, PaymentType, PaymentStatus } from '../../../lib/payment-history';

interface Props {
  paymentHistory: PaymentItem[];
  t: Record<string, string>;
}

function typeIcon(type: PaymentType) {
  switch (type) {
    case 'donation': return <Gift className="w-5 h-5 text-primary" />;
    case 'membership': return <Users className="w-5 h-5 text-primary" />;
    case 'wakala': return <Briefcase className="w-5 h-5 text-primary" />;
    case 'event': return <Calendar className="w-5 h-5 text-primary" />;
    case 'translation': return <Languages className="w-5 h-5 text-primary" />;
    case 'legal': return <Scale className="w-5 h-5 text-primary" />;
    default: return <CreditCard className="w-5 h-5 text-primary" />;
  }
}

function statusIcon(status: PaymentStatus) {
  switch (status) {
    case 'paid': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'refunded': return <XCircle className="w-4 h-4 text-gray-500" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function statusLabel(status: PaymentStatus, t: Record<string, string>): string {
  switch (status) {
    case 'paid': return t.paid || 'Paid';
    case 'pending': return t.pending || 'Pending';
    case 'failed': return t.rejected || 'Failed';
    case 'refunded': return t.refunded || 'Refunded';
    default: return status;
  }
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

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5 flex items-center justify-between">
        <span className="text-sm text-muted">{t.totalPaid}</span>
        <span className="text-2xl font-bold text-primary">£{totalPaid.toFixed(2)}</span>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider divide-y divide-divider">
        {paymentHistory.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center flex-shrink-0">
                {typeIcon(payment.type)}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{payment.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs font-bold text-gray-700">
                    {payment.amount > 0 ? `£${payment.amount.toFixed(2)}` : (t.unpaid || '—')}
                  </p>
                  {payment.created_at && (
                    <p className="text-xs text-muted">
                      · {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {payment.ref && (
                  <p className="text-xs text-muted font-mono mt-0.5 truncate max-w-[180px]">
                    {payment.ref}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusIcon(payment.status)}
              <span className="text-xs font-medium text-muted">{statusLabel(payment.status, t)}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
