# YCA Birmingham Admin Panel Setup

## Admin Panel Overview

The admin panel has been successfully created with complete control over all website features!

## Accessing the Admin Panel

**URL:** `/admin/login`

**Default Credentials (to be set up):**
- Email: Info@yca-birmingham.org.uk
- Password: Yca1233*

## Setting Up the Admin User

Since this is a new installation, you need to create the admin user in Supabase. Follow these steps:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add user" and create a new user with:
   - Email: `Info@yca-birmingham.org.uk`
   - Password: `Yca1233*`
4. Copy the user's UUID
5. Go to SQL Editor and run this query (replace `USER_UUID` with the actual UUID):

```sql
INSERT INTO admins (id, email, full_name, role, is_active)
VALUES ('USER_UUID', 'Info@yca-birmingham.org.uk', 'YCA Administrator', 'super_admin', true);
```

### Option 2: Using SQL Script

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the admin user in auth.users (Note: Replace with actual secure password hash)
-- This requires you to first create the user via Supabase Dashboard Authentication

-- Then insert into admins table
-- INSERT INTO admins (id, email, full_name, role, is_active)
-- SELECT id, email, 'YCA Administrator', 'super_admin', true
-- FROM auth.users
-- WHERE email = 'Info@yca-birmingham.org.uk';
```

## Admin Features

The admin panel includes complete management for:

### 📊 Dashboard
- Real-time statistics
- Total donations, events, registrations
- Recent activity feed
- Quick access to all sections

### 📰 News Management
- Create, edit, delete news articles
- Set categories and featured images
- Manage publication dates

### 📅 Events Management
- Create and manage events
- Set capacity and location
- Mark events as featured
- Track event details

### 👥 Registrations Management
- View all event registrations
- Export to CSV
- Search and filter

### 🎫 Membership Applications
- Review membership requests
- Approve or reject applications
- Export member data

### 🙋 Volunteer Applications
- Manage volunteer inquiries
- View skills and availability
- Export volunteer data

### 🤝 Partnership Requests
- Review partnership inquiries
- Track organization details
- Manage collaboration requests

### 💬 Contact Messages
- View and manage contact submissions
- Track inquiries and responses

### 💰 Donations Management
- Complete donation tracking
- Financial statistics
- Payment status monitoring
- Export donation reports

### 📧 Newsletter Subscribers
- Manage email subscriptions
- Export subscriber lists
- Track subscription status

### ⚙️ Site Settings
- Update contact information
- Manage social media links
- Configure site details

## Security Features

✅ Secure authentication with Supabase Auth
✅ Row Level Security (RLS) on all tables
✅ Protected routes with authentication guards
✅ Activity logging for admin actions
✅ Secure password handling
✅ Auto logout on inactivity

## Navigation

The admin panel features:
- Sidebar navigation (collapsible)
- Mobile-responsive design
- Quick access to all management sections
- Easy sign out functionality

## Data Export

All management pages support exporting data to CSV format for:
- Reporting
- Backup
- External analysis

## Best Practices

1. **Change Default Password:** After first login, update your password in Supabase Dashboard
2. **Regular Backups:** Export important data regularly
3. **Monitor Activity:** Check admin activity logs periodically
4. **Update Settings:** Keep contact information and social links current

## Support

For technical issues or questions, refer to the Supabase documentation or contact your development team.

---

**Built with:**
- React + TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- Vite

**Status:** ✅ Production Ready
