# YCA Website | موقع جمعية الشباب المسيحية

A comprehensive web platform for the Young Christian Association (YCA) featuring membership management, booking systems, event management, and multilingual support (Arabic & English).

موقع ويب متكامل لجمعية الشباب المسيحية يتضمن إدارة العضويات، نظام الحجوزات، إدارة الفعاليات، ودعم كامل للغتين العربية والإنجليزية.

## 🌟 Features | الميزات

### 🔐 Authentication System | نظام المصادقة
- Email/Password authentication
- Google OAuth integration
- Role-based access control (Members & Admins)
- Secure session management with Supabase Auth

### 👥 Membership Management | إدارة العضويات
- Three membership tiers: Basic, Standard, Premium
- Online membership application
- Automatic member number generation
- Membership renewal tracking
- Payment integration with Stripe

### 📅 Booking System | نظام الحجوزات
- Multi-activity booking: Football, Basketball, Volleyball, Padel, Billiards
- Real-time availability calendar
- Time slot management
- Booking confirmation and notifications
- Admin booking management

### 💳 Payment Integration | التكامل مع الدفع الإلكتروني
- Stripe payment gateway
- Secure checkout process
- Payment history tracking
- Event registration payments
- Membership fee payments

### 📰 Content Management | إدارة المحتوى
- Dynamic page content editing
- News and events management
- Image gallery management
- Multilingual content support
- SEO-friendly structure

### 🎨 User Interface | واجهة المستخدم
- Fully responsive design
- RTL (Right-to-Left) support for Arabic
- Modern animations with Framer Motion
- Accessible and user-friendly
- Dark mode ready

### 🛠️ Admin Dashboard | لوحة التحكم الإدارية
- Comprehensive analytics
- Member management
- Booking oversight
- Content editing
- Settings configuration
- Export functionality

## 🚀 Tech Stack | التقنيات المستخدمة

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend & Services
- **Supabase** - Database & Authentication
- **PostgreSQL** - Database
- **Stripe** - Payment processing
- **Supabase Edge Functions** - Serverless functions

### Libraries
- `@supabase/supabase-js` - Supabase client
- `@stripe/react-stripe-js` - Stripe components
- `react-intersection-observer` - Scroll animations
- `xlsx` - Excel export functionality

## 📋 Prerequisites | المتطلبات

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

## ⚙️ Installation | التثبيت

1. **Clone the repository | نسخ المستودع**
```bash
git clone https://github.com/yca1233/yca-website.git
cd yca-website
```

2. **Install dependencies | تثبيت الاعتماديات**
```bash
npm install
```

3. **Set up environment variables | إعداد المتغيرات البيئية**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- Supabase URL and Anon Key from [Supabase Dashboard](https://app.supabase.com)
- Stripe Publishable and Secret Keys from [Stripe Dashboard](https://dashboard.stripe.com)

4. **Set up Supabase database | إعداد قاعدة البيانات**

Run the migration files in order:
```bash
# Execute in Supabase SQL Editor or using Supabase CLI
migration_part1.sql
migration_part2.sql
migration_part3.sql
migration_part4.sql
setup-admin-user.sql
```

Or use the Supabase migrations folder:
```bash
supabase db push
```

5. **Deploy Edge Functions | نشر الدوال السحابية**
```bash
# If using Supabase CLI
supabase functions deploy manage-admin
supabase functions deploy manage-member
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-payment-intent
supabase functions deploy send-membership-notifications
```

6. **Start development server | تشغيل خادم التطوير**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build for Production | البناء للإنتاج

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure | هيكل المشروع

```
yca-website/
├── src/
│   ├── components/       # Reusable components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── booking/     # Booking system components
│   │   └── member/      # Member portal components
│   ├── contexts/        # React contexts (Auth, Language, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── pages/           # Page components
│   │   ├── about/       # About pages
│   │   ├── admin/       # Admin pages
│   │   ├── book/        # Booking pages
│   │   ├── get-involved/# Get involved pages
│   │   ├── member/      # Member portal pages
│   │   └── programmes/  # Programme pages
│   └── App.tsx          # Main app component
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── docs/               # Documentation files
```

## 📖 Documentation | التوثيق

Detailed documentation is available in the following files:

### English Documentation
- [Admin Setup Guide](ADMIN_SETUP.md) - Setting up admin accounts
- [Authentication Features](AUTHENTICATION_FEATURES.md) - Auth system overview
- [Booking System Guide](BOOKING_SYSTEM_GUIDE.md) - How the booking system works
- [Google Auth Setup](GOOGLE_AUTH_SETUP.md) - Setting up Google OAuth
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Project completion status
- [Membership & Booking System](MEMBERSHIP_AND_BOOKING_SYSTEM.md) - Complete guide

### Arabic Documentation | التوثيق بالعربية
- [دليل الإدارة ثنائي اللغة](BILINGUAL_ADMIN_GUIDE.md)
- [ملخص التطبيق ثنائي اللغة](BILINGUAL_IMPLEMENTATION_SUMMARY.md)
- [إعداد Google Auth بالعربية](GOOGLE_AUTH_SETUP_AR.md)

## 🔑 Default Admin Credentials | بيانات المسؤول الافتراضية

After running the database setup:
- **Email:** admin@yca.org
- **Password:** YCA@dmin2026!

**⚠️ Important: Change these credentials immediately after first login!**

## 🌐 Environment Variables | المتغيرات البيئية

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only) | ✅ |

## 🧪 Testing | الاختبار

### Test Stripe Payments
Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- Any future expiry date and any 3-digit CVC

## 📱 Features Walkthrough | جولة في الميزات

### For Members | للأعضاء
1. Register for membership online
2. Complete payment via Stripe
3. Access member dashboard
4. Book activities and services
5. Track booking history
6. Manage profile and settings

### For Admins | للمسؤولين
1. Login to admin dashboard
2. Manage members and applications
3. Oversee bookings and schedules
4. Edit website content
5. Configure settings
6. Generate reports and exports

## 🤝 Contributing | المساهمة

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License | الترخيص

This project is proprietary and confidential. All rights reserved to the Young Christian Association (YCA).

## 📞 Contact | التواصل

Young Christian Association (YCA)

- Website: [Visit YCA Website]
- Email: info@yca.org
- GitHub: [@yca1233](https://github.com/yca1233)

## 🙏 Acknowledgments | الشكر والتقدير

- Supabase team for the amazing backend platform
- Stripe for secure payment processing
- All contributors and supporters of YCA

---

**Made with ❤️ for the Young Christian Association**

**صُنع بـ ❤️ لجمعية الشباب المسيحية**
