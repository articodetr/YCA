# دليل إعداد تسجيل الدخول عبر Google

هذا الدليل سيساعدك على تفعيل المصادقة عبر Google لتطبيق جمعية الجالية اليمنية.

## المتطلبات الأساسية

- الوصول إلى لوحة تحكم مشروع Supabase الخاص بك
- حساب Google Cloud Console

## الخطوة 1: إعداد Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروعاً موجوداً
3. انتقل إلى **APIs & Services > Credentials**
4. انقر على **Create Credentials > OAuth client ID**
5. اختر **Web application** كنوع التطبيق
6. قم بتكوين شاشة موافقة OAuth إذا طُلب منك
7. أضف ما يلي إلى **Authorized redirect URIs**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   استبدل `<your-project-ref>` بمعرف مشروع Supabase الفعلي الخاص بك

8. انقر على **Create**
9. انسخ **Client ID** و **Client Secret**

## الخطوة 2: إعداد Supabase

1. اذهب إلى لوحة تحكم مشروع Supabase الخاص بك
2. انتقل إلى **Authentication > Providers**
3. ابحث عن **Google** في قائمة المزودين
4. فعّل **Enable Sign in with Google**
5. الصق **Client ID** من Google Cloud Console
6. الصق **Client Secret** من Google Cloud Console
7. انقر على **Save**

## الخطوة 3: اختبار التكامل

1. اذهب إلى التطبيق الخاص بك
2. انتقل إلى `/member/login` أو `/member/signup`
3. انقر على زر "التسجيل عبر Google"
4. يجب أن يتم توجيهك إلى صفحة تسجيل الدخول في Google
5. بعد المصادقة الناجحة، سيتم إعادة توجيهك إلى لوحة تحكم الأعضاء

## ملاحظات مهمة

- **رابط إعادة التوجيه**: تأكد من أن رابط إعادة التوجيه في Google Cloud Console يطابق عنوان مشروع Supabase الخاص بك تماماً
- **شاشة موافقة OAuth**: قد تحتاج إلى تكوين شاشة موافقة OAuth في Google Cloud Console قبل إنشاء بيانات الاعتماد
- **الإنتاج مقابل التطوير**: للإنتاج، أضف نطاق الإنتاج الخاص بك إلى عناوين URI المعتمدة لإعادة التوجيه
- **التطوير المحلي**: للتطوير المحلي، يمكنك إضافة `http://localhost:54321/auth/v1/callback` إلى عناوين URI المعتمدة لإعادة التوجيه

## استكشاف الأخطاء وإصلاحها

### خطأ "redirect_uri_mismatch"
- تحقق من أن URI لإعادة التوجيه في Google Cloud Console يطابق عنوان مشروع Supabase الخاص بك
- تأكد من حفظ التكوين في كل من Google Cloud Console و Supabase

### لم يتم إنشاء المستخدم في قاعدة البيانات
- تحقق من أن مصادقة Supabase الخاصة بك تم تكوينها بشكل صحيح
- تحقق من أن التأكيد التلقائي للبريد الإلكتروني مُفعّل في Supabase (Authentication > Settings)

### تدفق المصادقة عالق
- امسح ملفات تعريف الارتباط والذاكرة المؤقتة للمتصفح
- تحقق من وحدة تحكم المتصفح بحثاً عن أي أخطاء
- تحقق من أن بيانات اعتماد Google OAuth الخاصة بك صحيحة

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من وحدة تحكم المتصفح بحثاً عن رسائل الخطأ
2. راجع سجلات Supabase في لوحة التحكم
3. تحقق من إكمال جميع خطوات التكوين بشكل صحيح

## موارد إضافية

- [توثيق Supabase لـ Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [توثيق Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
