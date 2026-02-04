import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, User, Mail, Phone, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

export default function MembershipApplication() {
  const [searchParams] = useSearchParams();
  const membershipType = searchParams.get('type') || 'individual';
  const { language } = useLanguage();
  const { signUp } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postcode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    organizationName: '',
    organizationType: '',
    numberOfMembers: '',
    familyMembers: [] as Array<{ name: string; relationship: string; dateOfBirth: string }>,
  });

  const translations = {
    en: {
      title: 'Membership Application',
      subtitle: 'Join our community',
      personalInfo: 'Personal Information',
      accountInfo: 'Account Information',
      contactInfo: 'Contact Information',
      emergencyContact: 'Emergency Contact',
      organizationInfo: 'Organization Information',
      familyInfo: 'Family Members',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      city: 'City',
      postcode: 'Postcode',
      emergencyName: 'Emergency Contact Name',
      emergencyPhone: 'Emergency Contact Phone',
      organizationName: 'Organization Name',
      organizationType: 'Organization Type',
      numberOfMembers: 'Number of Members',
      addFamilyMember: 'Add Family Member',
      memberName: 'Member Name',
      relationship: 'Relationship',
      remove: 'Remove',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      successMessage: 'Application submitted successfully!',
      redirecting: 'Redirecting to payment...',
      passwordMismatch: 'Passwords do not match',
      errorMessage: 'Failed to submit application. Please try again.',
      required: 'This field is required',
    },
    ar: {
      title: 'طلب عضوية',
      subtitle: 'انضم إلى مجتمعنا',
      personalInfo: 'المعلومات الشخصية',
      accountInfo: 'معلومات الحساب',
      contactInfo: 'معلومات الاتصال',
      emergencyContact: 'جهة الاتصال في حالات الطوارئ',
      organizationInfo: 'معلومات المنظمة',
      familyInfo: 'أفراد العائلة',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      phone: 'رقم الهاتف',
      dateOfBirth: 'تاريخ الميلاد',
      address: 'العنوان',
      city: 'المدينة',
      postcode: 'الرمز البريدي',
      emergencyName: 'اسم جهة الاتصال الطارئة',
      emergencyPhone: 'هاتف جهة الاتصال الطارئة',
      organizationName: 'اسم المنظمة',
      organizationType: 'نوع المنظمة',
      numberOfMembers: 'عدد الأعضاء',
      addFamilyMember: 'إضافة فرد من العائلة',
      memberName: 'اسم الفرد',
      relationship: 'القرابة',
      remove: 'إزالة',
      submit: 'إرسال الطلب',
      submitting: 'جاري الإرسال...',
      successMessage: 'تم إرسال الطلب بنجاح!',
      redirecting: 'جاري التحويل للدفع...',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      errorMessage: 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.',
      required: 'هذا الحقل مطلوب',
    },
  };

  const t = translations[language];

  const membershipPrices: Record<string, number> = {
    individual: 10,
    family: 25,
    organization: 100,
    student: 5,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { name: '', relationship: '', dateOfBirth: '' }],
    }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
      });

      if (signUpError) throw signUpError;
      if (!authData?.user) throw new Error('User creation failed');

      // Create application data with all required fields
      const applicationData = {
        user_id: authData.user.id,
        membership_type: membershipType,
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        organization_name: membershipType === 'organization' ? formData.organizationName : null,
        organization_type: membershipType === 'organization' ? formData.organizationType : null,
        number_of_members: membershipType === 'organization' ? parseInt(formData.numberOfMembers) : null,
        status: 'pending',
        payment_status: 'pending',
      };

      // Insert the membership application
      const { data: application, error: appError } = await supabase
        .from('membership_applications')
        .insert([applicationData])
        .select()
        .maybeSingle();

      if (appError) throw appError;
      if (!application) throw new Error('Application creation failed');

      // If family membership, insert family members
      if (membershipType === 'family' && formData.familyMembers.length > 0) {
        const familyMembersData = formData.familyMembers.map(member => ({
          application_id: application.id,
          name: member.name,
          relationship: member.relationship,
          date_of_birth: member.dateOfBirth,
        }));

        const { error: familyError } = await supabase
          .from('membership_application_family_members')
          .insert(familyMembersData);

        if (familyError) {
          console.error('Family members insert error:', familyError);
          // Continue anyway - the main application was successful
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/member/payment?application_id=${application.id}&amount=${membershipPrices[membershipType]}`);
      }, 2000);
    } catch (err: any) {
      console.error('Application error:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successMessage}</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.redirecting}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.accountInfo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email} *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.confirmPassword} *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.personalInfo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.firstName} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.lastName} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone} *
                  </label>
                  <div className="relative">
                    <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dateOfBirth} *
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t.contactInfo}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.address} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.city} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.postcode} *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.emergencyContact}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.emergencyName} *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.emergencyPhone} *
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {membershipType === 'organization' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.organizationInfo}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.organizationName} *
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.organizationType} *
                      </label>
                      <input
                        type="text"
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.numberOfMembers} *
                      </label>
                      <input
                        type="number"
                        name="numberOfMembers"
                        value={formData.numberOfMembers}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {membershipType === 'family' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.familyInfo}
                </h3>
                <div className="space-y-4">
                  {formData.familyMembers.map((member, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.memberName}
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.relationship}
                          </label>
                          <input
                            type="text"
                            value={member.relationship}
                            onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.dateOfBirth}
                          </label>
                          <input
                            type="date"
                            value={member.dateOfBirth}
                            onChange={(e) => updateFamilyMember(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + {t.addFamilyMember}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
