# Membership and Booking System Implementation Guide

## ✅ Completed Infrastructure

### 1. Database Schema (✓ COMPLETE)
**Migration File:** `supabase/migrations/[timestamp]_create_membership_and_booking_system_v2.sql`

All required database tables have been created:

#### Tables Created:
1. **`members`** - Member profiles and accounts
   - Auto-generates member numbers (YCA20260001, etc.)
   - Supports all membership types: individual, family, associate, business_support
   - Tracks status, dates, and expiry

2. **`family_members`** - Family member details for family memberships

3. **`member_payments`** - Complete payment history
   - Tracks all payment types: membership, wakala, event, donation, service
   - Stripe integration ready
   - Supports all payment statuses

4. **`service_bookings`** - Advisory office and consultation bookings

5. **`wakala_applications`** - Wakala/Power of Attorney applications
   - Arabic form fields
   - 10-day rule logic
   - Pricing logic (£0, £20, £40)

6. **`event_registrations`** - Free and paid event registrations
   - Auto-generates booking references
   - Supports capacity tracking

7. **`service_slots`** - Available booking time slots

#### Functions Created:
- `generate_member_number()` - Auto-generates unique member IDs
- `generate_booking_reference()` - Auto-generates event booking refs
- `check_wakala_eligibility(member_uuid)` - Checks 10-day rule and pricing

### 2. Membership Page (✓ COMPLETE)
**File:** `src/pages/get-involved/Membership.tsx`

**Features Implemented:**
- ✅ All 4 membership types with correct pricing:
  - Individual: £15/year
  - Family: £25/year
  - Associate: £20/year
  - Business Support: £10+/month
- ✅ Short terms displayed for each type (EN + AR)
- ✅ Fully bilingual (English + Arabic)
- ✅ Interactive type selection
- ✅ Detailed terms and conditions
- ✅ "Apply Now" button (links to `/get-involved/membership/apply?type=...`)

**What's Next:**
The membership page is ready. You need to create the application form page that handles:
- Payment processing via Stripe
- Member account creation
- Email confirmation with login details

### 3. Build Status (✓ WORKING)
- Project builds successfully
- No TypeScript errors
- All translations working
- Bilingual system functional

---

## 📋 Remaining Implementation Tasks

### Priority 1: Payment Integration & Member Registration

#### A) Stripe Integration
You need to integrate Stripe for payment processing:

**Required:**
1. Set up Stripe account and get API keys
2. Add Stripe keys to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. Create Stripe payment intents edge function (already have template in `supabase/functions/create-payment-intent/`)
4. Handle webhooks for payment confirmation

#### B) Membership Application Form
**Create:** `src/pages/get-involved/MembershipApplication.tsx`

**Required Features:**
- Read membership type from URL query param
- Different forms for each membership type:
  - **Individual:** Basic personal details
  - **Family:** Personal details + family members (dynamic list)
  - **Associate:** Personal details + location outside Birmingham
  - **Business Support:** Business details + monthly amount selector (£10, £25, £50, £100, £250, custom)
- Payment integration with Stripe
- Create member record in database
- Send confirmation email with login details
- Redirect to member dashboard after payment

**Form Fields:**
- First Name, Last Name
- Email, Phone
- Address, Postcode
- Date of Birth
- For Family: Add family member button (name, DOB, relationship)
- For Business: Business name, logo upload
- For Business: Monthly amount selector
- Payment checkbox: "I confirm information use in line with YCA policies"

### Priority 2: Member Dashboard

#### Create Member Dashboard
**Create:** `src/pages/member/Dashboard.tsx`

**Features Required:**
- Member profile display
- Photo/logo upload
- Membership details (number, type, status, expiry)
- Payment history table
- Services used (high-level)
- Partnership submission form
- Edit profile button

**Authentication:**
- Use Supabase Auth for login
- Send magic link/one-time code on registration
- Protect dashboard with authentication

### Priority 3: Wakala Application System

#### A) Wakala Form Page
**Create:** `src/pages/wakala/WakalaApplication.tsx`

**Required Features:**
- Arabic-first form with RTL inputs
- Form title: **نموذج تقديم وكالة**
- Description: **يرجى تعبئة جميع الحقول المطلوبة وإرفاق المستندات اللازمة لتقديم وكالة.**

**Form Fields (All Arabic):**
1. **اسم الموكل*** (Applicant Name) - text, RTL
2. **رقم التلفون*** (Phone) - tel
3. **الايميل*** (Email) - email
4. **اسم الوكيل*** (Attorney Name) - text, RTL
5. **نوع الوكالة*** (Wakala Type) - select/dropdown, RTL
6. **صيغة الوكالة*** (Wakala Format) - select/dropdown, RTL
7. **صورة جواز الوكيل*** (Attorney Passport) - file upload
8. **صورة جواز الموكل*** (Applicant Passport) - file upload
9. **صور جوازات اثنين شهود*** (Witnesses Passports) - file upload
10. **حالة العضوية بالجالية*** (Membership Status) - dropdown: Member/Non-member
11. **رقم العضوية** (Member Number) - text (shows if Member selected)
12. **ملاحظات إضافية** (Additional Notes) - textarea, RTL

**Consent Checkbox:**
☑ "I confirm that I agree to the use of my information in line with YCA Birmingham policies."

**Pricing Logic (CRITICAL):**
```javascript
// When form is submitted:
1. If membership_status = "non_member" → Fee: £40
2. If membership_status = "member":
   a. Check member record in database
   b. Calculate days since start_date
   c. If days < 10 → Fee: £40 (membership too recent)
   d. If days ≥ 10:
      - Count previous wakala applications
      - If 0 (first wakala) → Fee: £0 (FREE)
      - If > 0 → Fee: £20

// Use the database function:
const { data } = await supabase.rpc('check_wakala_eligibility', { member_uuid: memberId });
// Returns: { is_eligible, is_first_wakala, fee_amount, reason }
```

**Dynamic Payment Text (Arabic):**
Display based on calculated fee:
- **Non-member:** "الرسوم: £40 لكل وكالة. يتم الدفع عبر الموقع عند تقديم الطلب."
- **First Wakala (eligible member):** "الرسوم: مجانية لأول وكالة للعضو المؤهل (بعد مرور 10 أيام على الاشتراك)."
- **Subsequent Wakala:** "الرسوم: £20 لكل وكالة ابتداءً من الطلب الثاني للعضو المؤهل (بعد مرور 10 أيام على الاشتراك). يتم الدفع عبر الموقع عند تقديم الطلب."

**Payment Flow:**
- If fee = £0: Submit directly (no payment step)
- If fee > £0: Redirect to Stripe checkout → Create payment → On success, create application

**File Upload:**
- Use Supabase Storage buckets
- Store URLs in database
- Validate file types (images only)

### Priority 4: Service Booking System

#### A) Booking Calendar Component
**Create:** `src/components/booking/BookingCalendar.tsx`

**Features:**
- Calendar view showing available slots
- Filter by service type: Advisory, Wakala, Consultation
- Click slot to book
- Show time slots (e.g., 9:00 AM, 9:30 AM, 10:00 AM)
- Visual indication of available/booked slots

#### B) Service Booking Pages
**Create:**
- `src/pages/services/BookAdvisory.tsx`
- `src/pages/services/BookConsultation.tsx`

**Advisory Office Booking:**
- If logged-in member → Simple form (service reason + notes)
- If not logged in → Full form (name, email, phone, reason, notes)
- Select date and time from calendar
- Free booking (no payment)

**Consultation Booking:**
- Similar to Advisory Office
- May have different time slots/availability

#### C) Admin Slot Management
**Create:** `src/pages/admin/ServiceSlotsManagement.tsx`

**Features:**
- Add/edit/delete available time slots
- Set duration per service type
- Mark slots as unavailable
- View all bookings

### Priority 5: Event Registration System

#### A) Free Event Registration Component
**Create:** `src/components/events/FreeEventRegistrationForm.tsx`

**Form Fields:**
- Full Name
- Email Address
- Phone Number (with WhatsApp checkbox)
- Event Name (auto-populated)
- Number of Attendees (1-5 dropdown)
- Are you a registered YCA Member? (Yes/No)
- Special Requirements / Accessibility (textarea)
- Emergency Contact Name & Number (for Youth/Children's events)

**Backend:**
- Save to `event_registrations` table
- Send confirmation email with calendar invite (.ics)
- Check capacity limit
- If full → Show "Fully Booked / Join Waiting List"

#### B) Paid Event Registration Component
**Create:** `src/components/events/PaidEventRegistrationForm.tsx`

**Form Fields:**
- Full Name, Email
- Ticket Selection:
  - Adult Ticket (£X) - Quantity selector
  - Child Ticket (£X) - Quantity selector
  - Member Discount Ticket (£X) - Quantity (if logged in)
- Total Amount (calculated)
- Dietary Requirements (Halal default, Vegetarian, Vegan, Allergies)
- Billing Address
- Payment Method (Stripe integration)

**Payment Flow:**
- Calculate total based on ticket quantities
- Redirect to Stripe checkout
- On success:
  - Generate unique booking reference
  - Save to `event_registrations` table
  - Create payment record
  - Send email with digital ticket/receipt

#### C) Update Events Page
**Modify:** `src/pages/Events.tsx`

**Add to Event Cards:**
- "Register" button for free events
- "Buy Tickets" button for paid events
- Capacity indicator (X/Y spots remaining)
- Event pricing display

#### D) Admin Event Management
**Modify:** `src/pages/admin/EventsManagement.tsx`

**Add Fields:**
- Is Paid Event (checkbox)
- Max Capacity (number)
- Ticket Price Adult (£)
- Ticket Price Child (£)
- Ticket Price Member (£)

---

## 🔧 Technical Implementation Notes

### Stripe Edge Functions

You already have templates in:
- `supabase/functions/create-payment-intent/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Update These Functions:**

1. **create-payment-intent:**
```typescript
// Add logic for different payment types
switch (payment_type) {
  case 'membership':
    // Calculate amount based on membership_type
    // individual: 1500 (£15), family: 2500 (£25), etc.
    break;
  case 'wakala':
    // Use check_wakala_eligibility function
    // Return 0, 2000, or 4000 (£0, £20, £40)
    break;
  case 'event':
    // Calculate based on ticket quantities
    break;
  case 'business_support':
    // Recurring subscription setup
    break;
}
```

2. **stripe-webhook:**
```typescript
// Handle payment_intent.succeeded
// Update member_payments table
// Create member record or wakala application
// Send confirmation email
```

### File Upload Strategy

**For Document Uploads (Wakala):**
1. Create storage bucket: `wakala-documents`
2. Upload files before form submission
3. Store URLs in form state
4. Submit URLs with form data

**Storage Security:**
```sql
-- Set up RLS for storage bucket
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wakala-documents');

CREATE POLICY "Admins can view all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'wakala-documents');
```

### Email Notifications

**Use Supabase Edge Functions or Third-Party Service:**

**Email Templates Needed:**
1. **Membership Confirmation:**
   - Member number
   - Login link
   - Membership details
   - Payment receipt

2. **Wakala Submission:**
   - Confirmation of submission
   - Fee amount paid
   - Status: Pending review
   - Estimated processing time

3. **Event Registration (Free):**
   - Booking reference
   - Event details
   - Calendar invite attachment
   - Location and time

4. **Event Ticket (Paid):**
   - Booking reference
   - Digital ticket (QR code)
   - Payment receipt
   - Event details

### Calendar Invite (.ics) Generation

```typescript
function generateICS(event: Event) {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YCA Birmingham//Event//EN
BEGIN:VEVENT
UID:${event.id}@yca-birmingham.org.uk
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.date)}
DTEND:${formatDate(event.end_date)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

  return ics;
}
```

---

## 🎯 Implementation Priority Order

### Week 1: Payment & Membership
1. ✅ Database schema (DONE)
2. ✅ Membership page (DONE)
3. ⏳ Set up Stripe account and keys
4. ⏳ Create membership application form
5. ⏳ Implement payment flow
6. ⏳ Member account creation
7. ⏳ Email notifications

### Week 2: Member Dashboard & Wakala
8. ⏳ Member authentication system
9. ⏳ Member dashboard page
10. ⏳ Wakala application form
11. ⏳ Wakala pricing logic
12. ⏳ File upload functionality
13. ⏳ Wakala admin management

### Week 3: Booking System
14. ⏳ Service slots management (admin)
15. ⏳ Booking calendar component
16. ⏳ Advisory booking page
17. ⏳ Consultation booking page
18. ⏳ Booking confirmations

### Week 4: Event Registration
19. ⏳ Free event registration form
20. ⏳ Paid event registration form
21. ⏳ Update Events page
22. ⏳ Update Events admin management
23. ⏳ Capacity tracking
24. ⏳ Digital tickets

---

## 📝 Example Implementation: Membership Application Form

Here's a starter template for the membership application form:

```typescript
// src/pages/get-involved/MembershipApplication.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function MembershipApplication() {
  const [searchParams] = useSearchParams();
  const membershipType = searchParams.get('type') || 'individual';
  const [clientSecret, setClientSecret] = useState('');

  const [formData, setFormData] = useState({
    membership_type: membershipType,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    date_of_birth: '',
    // Add family members array for family type
    family_members: [],
    // Add business fields for business type
    business_name: '',
    business_monthly_amount: 10,
  });

  // Calculate amount based on membership type
  const getAmount = () => {
    switch (membershipType) {
      case 'individual': return 1500; // £15
      case 'family': return 2500; // £25
      case 'associate': return 2000; // £20
      case 'business_support': return formData.business_monthly_amount * 100;
      default: return 1500;
    }
  };

  // Create payment intent
  const createPaymentIntent = async () => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_type: 'membership',
        membership_type: membershipType,
        amount: getAmount(),
        metadata: formData,
      }),
    });

    const { clientSecret } = await response.json();
    setClientSecret(clientSecret);
  };

  useEffect(() => {
    if (formData.first_name && formData.email) {
      createPaymentIntent();
    }
  }, [formData.first_name, formData.email]);

  // Form fields rendering based on membership type
  // Payment form
  // Success handling

  return (
    <div>
      {/* Form implementation */}
    </div>
  );
}
```

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Stripe account in production mode
- [ ] Update `.env` with production Stripe keys
- [ ] Test all payment flows thoroughly
- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Configure Supabase storage buckets
- [ ] Set proper storage RLS policies
- [ ] Test member registration end-to-end
- [ ] Test Wakala application with all pricing scenarios
- [ ] Test event registration (free and paid)
- [ ] Test booking calendar
- [ ] Set up proper error logging
- [ ] Create admin training documentation
- [ ] Test mobile responsiveness
- [ ] Accessibility testing
- [ ] Load testing for concurrent bookings
- [ ] Backup strategy for database

---

## 📞 Support & Questions

For implementation questions:
1. Review database schema in migration file
2. Check Stripe documentation for payment integration
3. Test locally with Stripe test mode first
4. Use Supabase documentation for auth and storage

## 🎉 Summary

**What's Done:**
✅ Complete database schema with all tables and functions
✅ Membership page with all 4 types and correct pricing
✅ Bilingual system (EN/AR) working
✅ Project builds successfully
✅ RLS policies set up
✅ Auto-generation of member numbers and booking references
✅ Wakala eligibility checker function

**What's Next:**
The foundation is solid. Now you need to:
1. Set up Stripe payment integration
2. Create application forms with payment flows
3. Build member dashboard with authentication
4. Implement Wakala form with file uploads and pricing logic
5. Create booking calendar system
6. Build event registration forms

All the database infrastructure is ready - focus on frontend forms and payment integration next!
