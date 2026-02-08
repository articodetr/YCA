# Supabase Authentication - Quick Setup
## إعداد سريع للمصادقة في Supabase

---

## 🚀 Quick Steps / الخطوات السريعة

### Step 1: Access Supabase Dashboard / الخطوة 1: الوصول إلى لوحة تحكم Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project: `gqiwjkuddhwtaylvqqsb`
3. Click on **Authentication** in the left sidebar

---

### Step 2: Configure URL Settings / الخطوة 2: تكوين إعدادات URL

Navigate to: **Authentication → URL Configuration**

#### Site URL / عنوان الموقع:
```
https://yca-birmingham-websi-zmk0.bolt.host
```

#### Redirect URLs / عناوين إعادة التوجيه:

Add each URL separately (click "Add URL" for each):

```
https://yca-birmingham-websi-zmk0.bolt.host/member/dashboard
```

```
https://yca-birmingham-websi-zmk0.bolt.host/member/login
```

```
https://yca-birmingham-websi-zmk0.bolt.host
```

```
https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback
```

**IMPORTANT:** Click "Save" button after adding all URLs!

**مهم:** انقر على زر "Save" بعد إضافة جميع العناوين!

---

### Step 3: Verify Email Provider / الخطوة 3: التحقق من موفر البريد الإلكتروني

Navigate to: **Authentication → Providers → Email**

Ensure:
- ✅ Email provider is **ENABLED** / مفعّل
- ✅ Confirm email is **DISABLED** (unless you need it) / غير مفعل
- ✅ Click **Save** / احفظ التغييرات

---

### Step 4: Configure Google OAuth (Optional) / الخطوة 4: تكوين Google OAuth (اختياري)

Navigate to: **Authentication → Providers → Google**

1. Toggle **Enable Google Provider** to ON / فعّل موفر Google
2. Add your Google OAuth credentials from Google Cloud Console
3. Authorized redirect URI should be:
   ```
   https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/callback
   ```
4. Click **Save** / احفظ

---

### Step 5: Test Authentication / الخطوة 5: اختبار المصادقة

#### Test Email Login / اختبار تسجيل الدخول بالبريد:
1. Go to: `https://yca-birmingham-websi-zmk0.bolt.host/member/login`
2. Enter credentials
3. Verify redirect to dashboard

#### Test Google OAuth / اختبار Google OAuth:
1. Click "Continue with Google" button
2. Complete Google authentication
3. Verify redirect to dashboard

---

## ✅ Checklist / قائمة التحقق

Before testing, ensure all these are completed:

قبل الاختبار، تأكد من إكمال جميع هذه الخطوات:

- [ ] Site URL is set to `https://yca-birmingham-websi-zmk0.bolt.host`
- [ ] All 4 redirect URLs are added
- [ ] "Save changes" button was clicked
- [ ] Email provider is enabled
- [ ] Google OAuth is configured (if using)
- [ ] Environment variables are correct in `.env` file

---

## 🔍 Visual Guide / الدليل المرئي

### What You Should See in Supabase Dashboard:

**Authentication → URL Configuration:**

```
┌─────────────────────────────────────────────────────────┐
│ Site URL                                                │
│ https://yca-birmingham-websi-zmk0.bolt.host            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                │
│ • https://yca-birmingham-websi-zmk0.bolt.host/member... │
│ • https://yca-birmingham-websi-zmk0.bolt.host/member... │
│ • https://yca-birmingham-websi-zmk0.bolt.host           │
│ • https://gqiwjkuddhwtaylvqqsb.supabase.co/auth/v1/...│
└─────────────────────────────────────────────────────────┘

                    [Save changes] ← CLICK THIS!
```

---

## 🐛 Common Issues / المشاكل الشائعة

### Issue 1: "Invalid Redirect URL"

**Solution / الحل:**
- Double-check all URLs in the redirect list
- Ensure no typos
- Make sure you clicked "Save changes"
- Wait 1-2 minutes for changes to propagate

### Issue 2: Google OAuth Not Working

**Solution / الحل:**
- Verify Google Cloud Console callback URL matches Supabase
- Check that Google+ API is enabled
- Confirm Client ID and Secret are correct

### Issue 3: Email Not Sending

**Solution / الحل:**
- Check Authentication → Email Templates
- Verify SMTP settings (if custom email)
- Consider disabling email confirmation for testing

---

## 📞 Need Help? / تحتاج مساعدة؟

If you encounter any issues:

إذا واجهت أي مشاكل:

1. Check the full documentation: `SUPABASE_AUTH_CONFIGURATION.md`
2. Visit Supabase docs: https://supabase.com/docs/guides/auth
3. Check Supabase Dashboard for error messages
4. Review browser console for authentication errors

---

## 🎉 Success Indicators / مؤشرات النجاح

You'll know it's working when:

ستعرف أنه يعمل عندما:

✅ Users can login with email/password without errors

✅ Google OAuth redirects to dashboard successfully

✅ New user registration completes without redirect errors

✅ Password reset emails are received

✅ No "Invalid redirect URL" errors in console

---

**Last Updated:** February 8, 2026

**Project:** YCA Birmingham Web Application

**Supabase Project:** gqiwjkuddhwtaylvqqsb
