import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Mail, Phone, MapPin, Shield, Calendar,
  Hash, Pencil, Save, X, Camera, Loader2, Lock, Globe2,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Props {
  user: User | null;
  memberRecord: any;
  memberProfile: any;
  profileForm: { full_name: string; phone: string; address: string; city: string; postcode: string };
  setProfileForm: (fn: (prev: any) => any) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
  savingProfile: boolean;
  handleSaveProfile: () => void;
  onProfileUpdate?: () => void;
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
  user, memberRecord, memberProfile, profileForm, setProfileForm,
  editingProfile, setEditingProfile, savingProfile, handleSaveProfile, onProfileUpdate, t,
}: Props) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const addressParts = [profileForm.address, profileForm.city, profileForm.postcode].filter(Boolean).join(', ');

  const avatarUrl = memberProfile?.avatar_url || user?.user_metadata?.avatar_url || '';
  const displayName = profileForm.full_name || user?.user_metadata?.full_name || '';
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] || '?').toUpperCase();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      const urlWithCache = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from('member_profiles')
        .update({ avatar_url: urlWithCache, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      await supabase.auth.updateUser({ data: { avatar_url: urlWithCache } });

      onProfileUpdate?.();
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const providerLabel = () => {
    const provider = user?.app_metadata?.provider;
    if (provider === 'google') return 'Google';
    return language === 'ar' ? 'البريد الإلكتروني' : 'Email';
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-sand border-2 border-divider flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="flex-1 text-center sm:text-start">
            <h2 className="text-xl font-bold text-primary">{displayName || user?.email}</h2>
            <p className="text-sm text-muted mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              {memberRecord && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  memberRecord.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  {memberRecord.status === 'active' ? t.active : t.expired}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Lock className="w-3.5 h-3.5" />
                {providerLabel()}
              </span>
              {joinDate && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  {joinDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  dir="ltr"
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
                    dir="ltr"
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
              {memberProfile?.preferred_language && (
                <InfoRow
                  icon={Globe2}
                  label={language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
                  value={memberProfile.preferred_language === 'ar' ? 'العربية' : 'English'}
                />
              )}
            </div>
          )}
        </motion.div>

        <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
          <h3 className="text-base font-bold text-primary mb-5">{t.membershipDetails}</h3>
          {memberRecord ? (
            <div>
              {memberRecord.member_number && (
                <div className="flex items-start gap-3 py-3 border-b border-divider">
                  <Hash className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted mb-0.5">{t.membershipNumber}</p>
                    <p className="text-sm font-mono font-bold text-primary">{memberRecord.member_number}</p>
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
              {memberRecord.start_date && (
                <div className="flex items-start gap-3 py-3 border-b border-divider">
                  <Calendar className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted mb-0.5">{t.startDate}</p>
                    <p className="text-sm font-medium text-primary">
                      {new Date(memberRecord.start_date).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 py-3">
                <Calendar className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted mb-0.5">{t.expiryDate}</p>
                  <p className="text-sm font-medium text-primary">
                    {memberRecord.expiry_date
                      ? new Date(memberRecord.expiry_date).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB')
                      : t.noExpiry}
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
      </div>
    </motion.div>
  );
}
