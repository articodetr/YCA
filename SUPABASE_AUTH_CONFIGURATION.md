# Supabase Authentication Configuration Guide
## دليل إعداد Supabase للمصادقة

---

## English Guide

### Overview
This document provides step-by-step instructions for configuring Supabase Authentication for the YCA Birmingham web application.

### 1. Site URL Configuration

**Location:** Authentication → URL Configuration → Site URL

**Value to set:**
```
https://yca-birmingham-websi-zmk0.bolt.host
```

**Purpose:** This is your primary application URL. All authentication flows will reference this as the base URL.

---

### 2. Authorized Redirect URLs

**Location:** Authentication → URL Configuration → Redirect URLs

**Add the following URLs (one per line):**

```
https://yca-birmingham-websi-zmk0.bolt.host/member/dashboard
https://yca-birmingham-websi-zmk0.bolt.host/member/login
https://yca-birmingham-websi-zmk0.bolt.host
https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback
```

**Purpose of each URL:**

1. **`/member/dashboard`** - Redirect destination after successful Google OAuth login
2. **`/member/login`** - Redirect destination after email verification for new signups
3. **`/` (root)** - General fallback redirect for authentication flows
4. **`/auth/v1/callback`** - Supabase's OAuth callback handler (required for OAuth providers)

---

### 3. Email Authentication Settings

**Location:** Authentication → Providers → Email

Ensure the following settings are configured:

- ✅ **Enable Email Provider:** ON
- ✅ **Confirm Email:** OFF (unless you specifically need email confirmation)
- ✅ **Secure Email Change:** ON (recommended)
- ✅ **Secure Password Change:** ON (recommended)

---

### 4. Google OAuth Configuration

**Location:** Authentication → Providers → Google

**Setup Steps:**

1. **Enable Google Provider:** Turn ON
2. **Add OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials (OAuth Client ID)
   - Set authorized redirect URI to: `https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback`

3. **Copy credentials to Supabase:**
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)

---

### 5. Additional Security Settings

**Location:** Authentication → Settings

**Recommended configuration:**

- **JWT Expiry:** 3600 (1 hour)
- **Refresh Token Rotation:** Enabled
- **Session Management:** Enabled
- **Auto Confirm Users:** Disabled (unless testing)

---

### 6. Testing Your Configuration

After saving all settings, test the following flows:

1. **Email/Password Login:**
   - Go to `/member/login`
   - Enter credentials and verify redirect to `/member/dashboard`

2. **Google OAuth Login:**
   - Click "Continue with Google" button
   - Complete Google authentication
   - Verify redirect to `/member/dashboard`

3. **New User Registration:**
   - Go to `/member/signup`
   - Register with email/password
   - Check email for verification (if enabled)
   - Verify redirect to `/member/login`

---

### 7. Environment Variables

Ensure your `.env` file contains the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://gqiwjkuddhwtaylvqqsb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXdqa3VkZGh3dGF5bHZxcXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTM2MTYsImV4cCI6MjA4NTM2OTYxNn0.rhBs4iWPKDhqeIdqV8zkv-Jh2qEauK6IwVHHpLxuxDc
```

---

### 8. Troubleshooting

**Issue: "Invalid Redirect URL" Error**
- ✅ Verify all URLs are added to Authorized Redirect URLs list
- ✅ Check for typos in URLs (including https://)
- ✅ Ensure no trailing slashes where not needed
- ✅ Click "Save changes" button after adding URLs

**Issue: Google OAuth Not Working**
- ✅ Verify Google OAuth credentials are correct
- ✅ Check that authorized redirect URI in Google Console matches Supabase
- ✅ Ensure Google+ API is enabled in Google Cloud Console

**Issue: Users Not Receiving Verification Emails**
- ✅ Check Supabase email provider settings
- ✅ Verify SMTP configuration (if using custom email)
- ✅ Check spam folder
- ✅ Consider using email confirmation OFF for testing

---

## الدليل بالعربية

### نظرة عامة
يوفر هذا المستند إرشادات خطوة بخطوة لتكوين Supabase Authentication لتطبيق جمعية الجالية اليمنية برمنغهام.

### 1. تكوين عنوان URL الرئيسي للموقع

**الموقع:** Authentication → URL Configuration → Site URL

**القيمة المطلوبة:**
```
https://yca-birmingham-websi-zmk0.bolt.host
```

**الغرض:** هذا هو عنوان URL الرئيسي لتطبيقك. ستشير جميع عمليات المصادقة إلى هذا العنوان كعنوان أساسي.

---

### 2. عناوين URL المصرح بها لإعادة التوجيه

**الموقع:** Authentication → URL Configuration → Redirect URLs

**أضف العناوين التالية (واحد في كل سطر):**

```
https://yca-birmingham-websi-zmk0.bolt.host/member/dashboard
https://yca-birmingham-websi-zmk0.bolt.host/member/login
https://yca-birmingham-websi-zmk0.bolt.host
https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback
```

**الغرض من كل عنوان:**

1. **`/member/dashboard`** - وجهة إعادة التوجيه بعد تسجيل دخول ناجح عبر Google OAuth
2. **`/member/login`** - وجهة إعادة التوجيه بعد التحقق من البريد الإلكتروني للمستخدمين الجدد
3. **`/` (الجذر)** - إعادة توجيه احتياطية عامة لعمليات المصادقة
4. **`/auth/v1/callback`** - معالج callback الخاص بـ Supabase OAuth (مطلوب لموفري OAuth)

---

### 3. إعدادات المصادقة عبر البريد الإلكتروني

**الموقع:** Authentication → Providers → Email

تأكد من تكوين الإعدادات التالية:

- ✅ **تفعيل موفر البريد الإلكتروني:** مفعّل
- ✅ **تأكيد البريد الإلكتروني:** غير مفعل (إلا إذا كنت بحاجة خاصة لتأكيد البريد)
- ✅ **تغيير البريد الإلكتروني الآمن:** مفعّل (موصى به)
- ✅ **تغيير كلمة المرور الآمن:** مفعّل (موصى به)

---

### 4. تكوين Google OAuth

**الموقع:** Authentication → Providers → Google

**خطوات الإعداد:**

1. **تفعيل موفر Google:** قم بالتفعيل
2. **إضافة بيانات اعتماد OAuth:**
   - انتقل إلى [Google Cloud Console](https://console.cloud.google.com/)
   - أنشئ مشروعاً جديداً أو اختر مشروعاً موجوداً
   - فعّل Google+ API
   - أنشئ بيانات اعتماد OAuth 2.0 (OAuth Client ID)
   - عيّن عنوان URI لإعادة التوجيه المصرح به إلى: `https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback`

3. **انسخ بيانات الاعتماد إلى Supabase:**
   - **معرّف العميل (Client ID):** (من Google Cloud Console)
   - **سر العميل (Client Secret):** (من Google Cloud Console)

---

### 5. إعدادات الأمان الإضافية

**الموقع:** Authentication → Settings

**التكوين الموصى به:**

- **انتهاء JWT:** 3600 (ساعة واحدة)
- **تدوير رمز التحديث:** مفعّل
- **إدارة الجلسة:** مفعّل
- **التأكيد التلقائي للمستخدمين:** غير مفعل (إلا أثناء الاختبار)

---

### 6. اختبار التكوين الخاص بك

بعد حفظ جميع الإعدادات، اختبر العمليات التالية:

1. **تسجيل الدخول عبر البريد الإلكتروني/كلمة المرور:**
   - انتقل إلى `/member/login`
   - أدخل بيانات الاعتماد وتحقق من إعادة التوجيه إلى `/member/dashboard`

2. **تسجيل الدخول عبر Google OAuth:**
   - انقر على زر "التسجيل عبر جوجل"
   - أكمل مصادقة Google
   - تحقق من إعادة التوجيه إلى `/member/dashboard`

3. **تسجيل مستخدم جديد:**
   - انتقل إلى `/member/signup`
   - سجّل باستخدام البريد الإلكتروني/كلمة المرور
   - تحقق من البريد الإلكتروني للتحقق (إذا كان مفعلاً)
   - تحقق من إعادة التوجيه إلى `/member/login`

---

### 7. متغيرات البيئة

تأكد من أن ملف `.env` يحتوي على بيانات اعتماد Supabase الصحيحة:

```env
VITE_SUPABASE_URL=https://gqiwjkuddhwtaylvqqsb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXdqa3VkZGh3dGF5bHZxcXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTM2MTYsImV4cCI6MjA4NTM2OTYxNn0.rhBs4iWPKDhqeIdqV8zkv-Jh2qEauK6IwVHHpLxuxDc
```

---

### 8. استكشاف الأخطاء وإصلاحها

**المشكلة: خطأ "Invalid Redirect URL"**
- ✅ تحقق من إضافة جميع عناوين URL إلى قائمة Authorized Redirect URLs
- ✅ تحقق من عدم وجود أخطاء إملائية في العناوين (بما في ذلك https://)
- ✅ تأكد من عدم وجود شرطات مائلة في النهاية حيث لا تكون مطلوبة
- ✅ انقر على زر "Save changes" بعد إضافة العناوين

**المشكلة: Google OAuth لا يعمل**
- ✅ تحقق من صحة بيانات اعتماد Google OAuth
- ✅ تأكد من أن عنوان URI المصرح به في Google Console يطابق Supabase
- ✅ تأكد من تفعيل Google+ API في Google Cloud Console

**المشكلة: المستخدمون لا يتلقون رسائل التحقق الإلكترونية**
- ✅ تحقق من إعدادات موفر البريد الإلكتروني في Supabase
- ✅ تحقق من تكوين SMTP (إذا كنت تستخدم بريد إلكتروني مخصص)
- ✅ تحقق من مجلد الرسائل غير المرغوب فيها
- ✅ فكر في استخدام تأكيد البريد الإلكتروني غير مفعل للاختبار

---

## Summary / الملخص

✅ **Site URL configured:** `https://yca-birmingham-websi-zmk0.bolt.host`

✅ **Redirect URLs added:**
- `/member/dashboard` (Google OAuth)
- `/member/login` (Email verification)
- `/` (General fallback)
- `/auth/v1/callback` (Supabase OAuth handler)

✅ **Email Authentication:** Enabled

✅ **Google OAuth:** Configured with credentials

✅ **Environment variables:** Updated in `.env` file

---

## Support / الدعم

For additional help, contact:
- **Technical Support:** Visit Supabase documentation at https://supabase.com/docs
- **Project Support:** Check the project repository for issues and updates

للمساعدة الإضافية، اتصل:
- **الدعم الفني:** قم بزيارة وثائق Supabase على https://supabase.com/docs
- **دعم المشروع:** تحقق من مستودع المشروع للمشاكل والتحديثات
