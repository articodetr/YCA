import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, MapPin, Shield, Calendar, Hash, Pencil, Save, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { staggerContainer, staggerItem } from '../../../lib/animations';

interface Props {
  user: User | null;
  memberRecord: any;
  profileForm: { full_name: string; phone: string; address: string; city: string; postcode: string };
  setProfileForm: (fn: (prev: any) => any) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
  savingProfile: boolean;
  handleSaveProfile: () => void;
  t: Record<string, string>;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-divider last:border-0">
      <Icon className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted mb-0.5">{label}</p>
        <p className="text-sm font-medium text-primary break-words">{value}</p>
      </div>
    </div>
  );
}

export default function ProfileTab({
  user, memberRecord, profileForm, setProfileForm,
  editingProfile, setEditingProfile, savingProfile, handleSaveProfile, t,
}: Props) {
  const addressParts = [profileForm.address, profileForm.city, profileForm.postcode].filter(Boolean).join(', ');

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-primary">{t.personalInfo}</h3>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {t.editProfile}
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t.fullName}</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={e => setProfileForm((p: any) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-divider rounded-lg text-sm text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t.phone}</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm((p: any) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-divider rounded-lg text-sm text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t.address}</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={e => setProfileForm((p: any) => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2.5 border border-divider rounded-lg text-sm text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t.city}</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={e => setProfileForm((p: any) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-divider rounded-lg text-sm text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t.postcode}</label>
                <input
                  type="text"
                  value={profileForm.postcode}
                  onChange={e => setProfileForm((p: any) => ({ ...p, postcode: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-divider rounded-lg text-sm text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? t.saving : t.saveProfile}
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="flex-1 flex items-center justify-center gap-2 border border-divider text-muted hover:text-primary hover:border-primary font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <InfoRow icon={UserIcon} label={t.fullName} value={profileForm.full_name || user?.user_metadata?.full_name || ''} />
            <InfoRow icon={Mail} label={t.email} value={user?.email || ''} />
            <InfoRow icon={Phone} label={t.phone} value={profileForm.phone} />
            <InfoRow icon={MapPin} label={t.address} value={addressParts} />
          </div>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
        <h3 className="text-base font-bold text-primary mb-5">{t.membershipDetails}</h3>
        {memberRecord ? (
          <div>
            {memberRecord.membership_number && (
              <div className="flex items-start gap-3 py-3 border-b border-divider">
                <Hash className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted mb-0.5">{t.membershipNumber}</p>
                  <p className="text-sm font-mono font-bold text-primary">{memberRecord.membership_number}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 py-3 border-b border-divider">
              <Shield className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted mb-0.5">{t.membershipStatus}</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                  memberRecord.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {memberRecord.status === 'active' ? t.active : t.expired}
                </span>
              </div>
            </div>
            {memberRecord.membership_start_date && (
              <div className="flex items-start gap-3 py-3 border-b border-divider">
                <Calendar className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted mb-0.5">{t.startDate}</p>
                  <p className="text-sm font-medium text-primary">{new Date(memberRecord.membership_start_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 py-3">
              <Calendar className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted mb-0.5">{t.expiryDate}</p>
                <p className="text-sm font-medium text-primary">
                  {memberRecord.membership_end_date ? new Date(memberRecord.membership_end_date).toLocaleDateString() : t.noExpiry}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-muted" />
            </div>
            <p className="text-sm text-muted">{t.noMembership}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
