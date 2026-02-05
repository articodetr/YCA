# Booking System Guide

## Overview

A modern, bilingual (English/Arabic) booking system for YCA Birmingham with clean, minimal UI inspired by Setmore.

## Features

### User Features
- **Service Selection**: Choose between Advisory Office Services and Wakala Services
- **Calendar View**: Interactive monthly calendar with date selection
- **Time Slots**: Available time slots displayed in a grid layout
- **Booking Summary**: Real-time summary of selected booking details
- **Contact Form**: Simple form to collect client information
- **Location Options**: Choose between Birmingham Office or Online appointments
- **Bilingual**: Full support for English and Arabic (RTL)
- **Responsive**: Optimized layouts for mobile and desktop

### Admin Features
- **Availability Management**: Add, remove, and block time slots
- **Service Management**: Control which services are available
- **Date Selection**: Manage availability for specific dates
- **Quick Setup**: Generate default time slots (9 AM - 5 PM)
- **Settings**: Configure maximum booking days ahead
- **Real-time Updates**: Changes reflect immediately on the booking page

## Database Schema

### Tables

1. **booking_services**
   - Stores available services (Advisory Office, Wakala)
   - Fields: id, name_en, name_ar, duration_minutes, is_active

2. **availability_slots**
   - Stores time slots for each service and date
   - Fields: id, service_id, date, start_time, end_time, is_available, is_blocked_by_admin

3. **bookings**
   - Stores confirmed bookings
   - Fields: id, service_id, slot_id, date, start_time, end_time, client_name, client_email, client_phone, location_type, notes, status

4. **booking_settings**
   - Global settings for the booking system
   - Fields: id, max_booking_days_ahead

## User Flow

1. **Visit Booking Page**: `/booking`
2. **Select Service**: Choose Advisory or Wakala service
3. **Pick Date**: Click on available date in calendar
4. **Choose Time**: Select from available time slots
5. **Review Summary**: Check booking details on the right panel
6. **Enter Details**: Fill in name, email, phone, location preference
7. **Confirm**: Submit booking

## Admin Flow

1. **Login to Admin**: `/admin/login`
2. **Navigate to Availability**: `/admin/availability`
3. **Select Service**: Choose which service to manage
4. **Pick Date**: Select the date to manage
5. **Add Slots**: Either generate default slots or add custom ones
6. **Manage Slots**: Block/unblock or delete slots as needed
7. **Save Settings**: Update max booking days ahead

## Design Features

### Mobile Layout (Setmore-style)
- Dark background (#1b2b45)
- Calendar at top
- Time slots in 2-column grid below
- Large, tappable buttons
- Warning messages for booking limits

### Desktop Layout (Confirm Reservation-style)
- Two-column layout
- Left: Calendar + Time Slots + Contact Form
- Right: Booking Summary Card
- Clean white cards on dark background
- Sticky summary card

## Responsive Breakpoints

- Mobile: < 1024px (single column)
- Desktop: ≥ 1024px (two columns)

## Availability Rules

1. **Maximum Days Ahead**: Configurable (default: 30 days)
2. **Past Dates**: Automatically disabled
3. **Far Future**: Warning message displayed
4. **Unavailable Slots**: Hidden from user view
5. **Blocked Slots**: Admin-controlled blocking

## Color Scheme

- Primary Background: `#111827` (gray-900)
- Card Background: `#1f2937` (gray-800)
- Accent Color: `#14b8a6` (teal-600)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#9ca3af` (gray-400)

## Accessing the System

### Public Booking Page
- URL: `/booking`
- Available from main navigation menu
- Desktop: Button in header "Book Appointment"
- Mobile: Link in mobile menu "احجز موعد"

### Admin Panel
- URL: `/admin/availability`
- Requires admin authentication
- Accessible from admin dashboard sidebar

## API Integration

### Load Services
```typescript
const { data } = await supabase
  .from('booking_services')
  .select('*')
  .eq('is_active', true);
```

### Load Slots
```typescript
const { data } = await supabase
  .from('availability_slots')
  .select('*')
  .eq('service_id', serviceId)
  .eq('date', date)
  .eq('is_available', true)
  .eq('is_blocked_by_admin', false);
```

### Create Booking
```typescript
const { error } = await supabase
  .from('bookings')
  .insert({
    service_id: serviceId,
    slot_id: slotId,
    date: date,
    start_time: startTime,
    end_time: endTime,
    client_name: name,
    client_email: email,
    client_phone: phone,
    location_type: locationType,
    notes: notes,
    status: 'pending'
  });
```

## Quick Start for Admins

1. **Generate Default Slots**:
   - Select a service
   - Pick a date
   - Click "Generate Default Slots (9AM - 5PM)"
   - This creates 30-minute slots throughout the day

2. **Block a Time Slot**:
   - Find the slot in the list
   - Click "Toggle Block"
   - Slot becomes unavailable to users

3. **Delete a Time Slot**:
   - Click the trash icon
   - Confirm deletion

4. **Update Settings**:
   - Change "Maximum Days Ahead" value
   - Click "Save Settings"

## Best Practices

1. **Regular Updates**: Update availability weekly
2. **Block vs Delete**: Use block for temporary unavailability
3. **Consistent Schedule**: Generate slots in batches for consistency
4. **Monitor Bookings**: Check bookings regularly via admin panel
5. **Test Booking Flow**: Periodically test the user experience

## Troubleshooting

### No Available Slots
- Check if slots exist for the selected date/service
- Verify slots are not blocked by admin
- Ensure date is within max booking days ahead

### Booking Not Showing
- Check bookings table in admin panel
- Verify RLS policies allow admin access
- Check booking status field

### Calendar Warning Message
- User is navigating beyond max days ahead
- Adjust settings if needed
- Message dismisses automatically after 3 seconds

## Future Enhancements

- Email notifications for bookings
- SMS reminders
- Calendar sync (Google/Outlook)
- Recurring appointments
- Multiple staff members
- Booking cancellation by users
- Payment integration for paid services
