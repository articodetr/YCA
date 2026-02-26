import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Building, BarChart3, Palette, Lock, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import ImageUploader from '../../components/admin/ImageUploader';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('branding');
  const { refreshSettings } = useSiteSettings();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;

      const settingsObj: Record<string, string> = { translation_enabled: 'false' };
      data?.forEach((setting) => {
        const val = setting.value;
        settingsObj[setting.key] = typeof val === 'string' ? val.replace(/^"|"$/g, '') : String(val);
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
      }
      await refreshSettings();
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    setPasswordMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error: any) {
      setPasswordMessage(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const sections = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'contact', label: 'Contact Info', icon: Globe },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'stats', label: 'Homepage Stats', icon: BarChart3 },
    { id: 'features', label: 'Features', icon: ToggleRight },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage site settings, branding, and configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === s.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeSection === 'password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>

              {passwordMessage && (
                <div className={`p-3 rounded-lg text-sm ${passwordMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {passwordMessage}
                </div>
              )}

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Re-enter new password"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding</h2>
              <p className="text-sm text-gray-500 mb-6">Upload your organization logos. These appear in the header and footer across the entire site.</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Main Logo (Square/Icon)</p>
                  {settings.site_logo && settings.site_logo !== '/logo.png' && (
                    <div className="mb-3 p-4 bg-gray-50 rounded-lg inline-block">
                      <img src={settings.site_logo} alt="Current logo" className="h-16 w-auto" />
                    </div>
                  )}
                  <ImageUploader
                    bucket="content-images"
                    currentImage={settings.site_logo && settings.site_logo !== '/logo.png' ? settings.site_logo : null}
                    onUploadSuccess={(url) => updateSetting('site_logo', url)}
                    label="Upload Main Logo"
                  />
                  <p className="text-xs text-gray-400 mt-2">Current: {settings.site_logo || '/logo.png'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Text Logo (Wide/Banner)</p>
                  {settings.site_logo_text && settings.site_logo_text !== '/logo_text.png' && (
                    <div className="mb-3 p-4 bg-gray-50 rounded-lg inline-block">
                      <img src={settings.site_logo_text} alt="Current text logo" className="h-12 w-auto" />
                    </div>
                  )}
                  <ImageUploader
                    bucket="content-images"
                    currentImage={settings.site_logo_text && settings.site_logo_text !== '/logo_text.png' ? settings.site_logo_text : null}
                    onUploadSuccess={(url) => updateSetting('site_logo_text', url)}
                    label="Upload Text Logo"
                  />
                  <p className="text-xs text-gray-400 mt-2">Current: {settings.site_logo_text || '/logo_text.png'}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'organization' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name (English)</label>
                  <input
                    type="text"
                    value={settings.org_name_en || ''}
                    onChange={(e) => updateSetting('org_name_en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={settings.org_name_ar || ''}
                    onChange={(e) => updateSetting('org_name_ar', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (English)</label>
                  <input
                    type="text"
                    value={settings.org_tagline_en || ''}
                    onChange={(e) => updateSetting('org_tagline_en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={settings.org_tagline_ar || ''}
                    onChange={(e) => updateSetting('org_tagline_ar', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Charity Number</label>
                <input
                  type="text"
                  value={settings.charity_number || ''}
                  onChange={(e) => updateSetting('charity_number', e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={settings.contact_phone || ''}
                    onChange={(e) => updateSetting('contact_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={settings.contact_address || ''}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
              <div className="grid gap-4">
                {[
                  { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
                  { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
                  { key: 'social_twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                  { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{social.label}</label>
                    <input
                      type="url"
                      value={settings[social.key] || ''}
                      onChange={(e) => updateSetting(social.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Homepage Statistics</h2>
              <p className="text-sm text-gray-500 mb-6">These numbers are displayed in the statistics section on the homepage.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: 'stat_members', label: 'Active Members', suffix: '+' },
                  { key: 'stat_programmes', label: 'Core Programmes', suffix: '' },
                  { key: 'stat_years', label: 'Years of Service', suffix: '+' },
                  { key: 'stat_impact', label: 'Lives Impacted', suffix: '+' },
                ].map((stat) => (
                  <div key={stat.key} className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{stat.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings[stat.key] || '0'}
                        onChange={(e) => updateSetting(stat.key, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        min="0"
                      />
                      {stat.suffix && <span className="text-lg font-bold text-gray-400">{stat.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <p className="text-sm text-gray-500 mb-6">Enable or disable services and features across the site.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Translation Service</p>
                    <p className="text-xs text-gray-500 mt-0.5">Show or hide the Translation Service in the navigation, booking page, and admin panel.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('translation_enabled', settings['translation_enabled'] === 'true' ? 'false' : 'true')}
                    className="flex-shrink-0 ml-4"
                    title="Toggle Translation Service"
                  >
                    {settings['translation_enabled'] === 'true' ? (
                      <ToggleRight className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">Click "Save Changes" at the top to apply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
