# Authentication Features | ميزات المصادقة

This document describes the authentication features available in the YCA Birmingham application.

---

## Available Authentication Methods | طرق المصادقة المتاحة

### 1. Email & Password Authentication | المصادقة بالإيميل وكلمة المرور

Members can register and sign in using their email address and password.

يمكن للأعضاء التسجيل وتسجيل الدخول باستخدام عنوان البريد الإلكتروني وكلمة المرور.

**Features | الميزات:**
- ✅ Secure password authentication | مصادقة آمنة بكلمة المرور
- ✅ Password reset functionality | وظيفة إعادة تعيين كلمة المرور
- ✅ Email validation | التحقق من البريد الإلكتروني
- ✅ Minimum 6 characters password | كلمة مرور من 6 أحرف على الأقل

**Pages | الصفحات:**
- Login: `/member/login` | تسجيل الدخول
- Signup: `/member/signup` | التسجيل

---

### 2. Google OAuth Authentication | المصادقة عبر Google

Members can sign up or sign in instantly using their Google account.

يمكن للأعضاء التسجيل أو تسجيل الدخول فوراً باستخدام حساب Google الخاص بهم.

**Benefits | الفوائد:**
- ⚡ Quick registration - no password needed | تسجيل سريع - لا حاجة لكلمة مرور
- 🔒 Enhanced security through Google | أمان محسّن من خلال Google
- 📧 Email verified automatically | التحقق من البريد الإلكتروني تلقائياً
- 🎯 One-click authentication | مصادقة بنقرة واحدة

**Setup Required | مطلوب الإعداد:**

To enable Google authentication, you need to configure it in Supabase. See the setup guides:
- [English Setup Guide](./GOOGLE_AUTH_SETUP.md)
- [Arabic Setup Guide](./GOOGLE_AUTH_SETUP_AR.md)

لتفعيل مصادقة Google، تحتاج إلى تكوينها في Supabase. انظر أدلة الإعداد:
- [دليل الإعداد بالإنجليزية](./GOOGLE_AUTH_SETUP.md)
- [دليل الإعداد بالعربية](./GOOGLE_AUTH_SETUP_AR.md)

---

## User Flow | تدفق المستخدم

### New Members | الأعضاء الجدد

1. **Choose Registration Method | اختر طريقة التسجيل:**
   - Click "Apply Now" on membership page | انقر على "قدم الآن" في صفحة العضوية
   - Or visit `/member/signup` directly | أو قم بزيارة `/member/signup` مباشرة

2. **Option A: Google Sign-up | الخيار أ: التسجيل عبر Google:**
   - Click "Sign up with Google" | انقر على "التسجيل عبر Google"
   - Authorize with Google account | قم بالترخيص بحساب Google
   - Automatically redirected to dashboard | إعادة توجيه تلقائية إلى لوحة التحكم

3. **Option B: Email Sign-up | الخيار ب: التسجيل بالإيميل:**
   - Enter full name, email, and password | أدخل الاسم الكامل والبريد الإلكتروني وكلمة المرور
   - Confirm password | تأكيد كلمة المرور
   - Click "Create Account" | انقر على "إنشاء حساب"
   - Redirected to dashboard | إعادة توجيه إلى لوحة التحكم

### Existing Members | الأعضاء الحاليون

1. **Visit Login Page | زيارة صفحة تسجيل الدخول:**
   - Go to `/member/login` | اذهب إلى `/member/login`

2. **Choose Sign-in Method | اختر طريقة تسجيل الدخول:**
   - **Google:** Click "Continue with Google" | **Google:** انقر على "التسجيل عبر Google"
   - **Email:** Enter email and password | **الإيميل:** أدخل البريد الإلكتروني وكلمة المرور

3. **Access Dashboard | الوصول إلى لوحة التحكم:**
   - View membership status | عرض حالة العضوية
   - Apply for services | التقديم للخدمات
   - Manage profile | إدارة الملف الشخصي

---

## Security Features | ميزات الأمان

- 🔐 **Secure password hashing** | تشفير آمن لكلمات المرور
- 🔑 **OAuth 2.0 standard for Google** | معيار OAuth 2.0 لـ Google
- 🛡️ **Session management** | إدارة الجلسات
- 🚪 **Automatic logout on session expiry** | تسجيل خروج تلقائي عند انتهاء الجلسة
- 📱 **CSRF protection** | حماية CSRF
- ✉️ **Email verification** | التحقق من البريد الإلكتروني

---

## Technical Details | التفاصيل التقنية

### Authentication Context
Location: `src/contexts/MemberAuthContext.tsx`

**Available Methods:**
```typescript
{
  signIn: (email: string, password: string) => Promise
  signInWithGoogle: () => Promise
  signUp: (email: string, password: string, metadata?: any) => Promise
  signOut: () => Promise
  resetPassword: (email: string) => Promise
}
```

### Protected Routes
All member routes require authentication:
- `/member/dashboard` - Member dashboard
- `/member/wakala/apply` - Wakala application
- `/member/payment` - Payment processing

### Database Integration
- User accounts stored in Supabase `auth.users`
- Additional member data in `membership_applications` table
- Automatic user profile creation on signup

---

## Troubleshooting | استكشاف الأخطاء

### Common Issues | المشاكل الشائعة

**Google Sign-in Not Working | تسجيل الدخول عبر Google لا يعمل:**
- ❌ Google OAuth not configured in Supabase
- ✅ Follow setup guide: [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)

**"User Already Exists" Error | خطأ "المستخدم موجود بالفعل":**
- ❌ Email already registered
- ✅ Use the login page instead of signup

**Password Reset Not Working | إعادة تعيين كلمة المرور لا تعمل:**
- ❌ Email not found in system
- ✅ Check email address or contact support

**Redirect Issues After Login | مشاكل إعادة التوجيه بعد تسجيل الدخول:**
- ❌ Session not established properly
- ✅ Clear browser cache and try again

---

## Support | الدعم

For authentication issues:
- Check browser console for error messages
- Review Supabase logs in dashboard
- Contact admin support

للحصول على مشاكل المصادقة:
- تحقق من وحدة تحكم المتصفح لرسائل الخطأ
- راجع سجلات Supabase في لوحة التحكم
- اتصل بدعم المسؤول
