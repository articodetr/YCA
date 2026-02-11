import { useState } from 'react';
import { X, Loader2, UserPlus, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  business_support_tier: string;
  custom_amount: number;
  payment_frequency: string;
  notes: string;
}

const MEMBERSHIP_PRICES: Record<string, number> = {
  individual: 20,
  family: 30,
  associate: 20,
  business_support: 0,
  organization: 50,
};

const initialForm: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  membership_type: 'individual',
  payment_amount: 20,
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  business_support_tier: 'bronze',
  custom_amount: 250,
  payment_frequency: 'annual',
  notes: '',
};

export default function AddMemberModal({ open, onClose, onSuccess }: AddMemberModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ email: string; password: string; member_number: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTypeChange = (type: string) => {
    const amount = type === 'business_support' ? form.custom_amount : (MEMBERSHIP_PRICES[type] || 0);
    setForm(prev => ({ ...prev, membership_type: type, payment_amount: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload: Record<string, unknown> = {
        action: 'create',
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        membership_type: form.membership_type,
        payment_amount: form.payment_amount,
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        notes: form.notes,
      };

      if (form.membership_type === 'business_support') {
        payload.business_support_tier = form.business_support_tier;
        payload.custom_amount = form.custom_amount;
        payload.payment_frequency = form.payment_frequency;
      }

      let edgeFnData: any = null;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-member`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          edgeFnData = data;
        } else if (response.ok || response.status === 400) {
          throw new Error(data.error || 'Failed to create member');
        }
      } catch (fnErr: any) {
        if (fnErr.message && !fnErr.message.includes('fetch')) {
          throw fnErr;
        }
      }

      if (edgeFnData) {
        setResult({
          email: edgeFnData.email,
          password: edgeFnData.password,
          member_number: edgeFnData.member_number,
        });
        onSuccess();
        return;
      }

      const appInsert: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: '',
        membership_type: form.membership_type,
        status: 'approved',
        payment_status: 'completed',
      };

      if (form.membership_type === 'business_support') {
        appInsert.business_support_tier = form.business_support_tier;
        appInsert.custom_amount = form.custom_amount;
        appInsert.payment_frequency = form.payment_frequency;
      }

      const { error: insertError } = await supabase
        .from('membership_applications')
        .insert(appInsert);

      if (insertError) throw new Error(insertError.message);

      setResult({
        email: form.email,
        password: '(No account created - application added only)',
        member_number: 'Will be assigned automatically',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Email: ${result.email}\nPassword: ${result.password}\nMember Number: ${result.member_number}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setForm(initialForm);
    setError('');
    setResult(null);
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {result ? 'Member Created' : 'Add Existing Member'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          {result ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-gray-600">The member account has been created successfully.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Number</label>
                  <p className="text-sm font-mono font-bold text-gray-900 mt-0.5">{result.member_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm font-mono text-gray-900 mt-0.5">{result.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
                  <p className="text-sm font-mono text-gray-900 mt-0.5 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                    {result.password}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type *</label>
                <select
                  value={form.membership_type}
                  onChange={e => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="individual">Individual - £20/year</option>
                  <option value="family">Family - £30/year</option>
                  <option value="associate">Associate - £20/year</option>
                  <option value="business_support">Business Support</option>
                  <option value="organization">Organization - £50/year</option>
                </select>
              </div>

              {form.membership_type === 'business_support' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Tier</label>
                    <select
                      value={form.business_support_tier}
                      onChange={e => {
                        const tier = e.target.value;
                        const amounts: Record<string, number> = { bronze: 250, silver: 500, gold: 1000, platinum: 2500 };
                        setForm(p => ({ ...p, business_support_tier: tier, custom_amount: amounts[tier] || 250, payment_amount: amounts[tier] || 250 }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="bronze">Bronze - £250</option>
                      <option value="silver">Silver - £500</option>
                      <option value="gold">Gold - £1,000</option>
                      <option value="platinum">Platinum - £2,500</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                    <select
                      value={form.payment_frequency}
                      onChange={e => setForm(p => ({ ...p, payment_frequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="annual">Annual</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.payment_amount}
                    onChange={e => setForm(p => ({ ...p, payment_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={form.payment_date}
                    onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Optional notes..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Member...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Member Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
