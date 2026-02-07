# Google OAuth Setup Guide

This guide will help you enable Google authentication for your YCA Birmingham application.

## Prerequisites

- Access to your Supabase project dashboard
- A Google Cloud Console account

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth consent screen if prompted
7. Add the following to **Authorized redirect URIs**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your actual Supabase project reference ID

8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** in the list of providers
4. Toggle **Enable Sign in with Google**
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Click **Save**

## Step 3: Test the Integration

1. Go to your application
2. Navigate to `/member/login` or `/member/signup`
3. Click the "Continue with Google" button
4. You should be redirected to Google's login page
5. After successful authentication, you'll be redirected back to the member dashboard

## Important Notes

- **Redirect URL**: Make sure the redirect URL in Google Cloud Console matches your Supabase project URL exactly
- **OAuth Consent Screen**: You may need to configure the OAuth consent screen in Google Cloud Console before creating credentials
- **Production vs Development**: For production, add your production domain to the authorized redirect URIs
- **Local Development**: For local development, you can add `http://localhost:54321/auth/v1/callback` to the authorized redirect URIs

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify that the redirect URI in Google Cloud Console matches your Supabase project URL
- Make sure you've saved the configuration in both Google Cloud Console and Supabase

### User Not Created in Database
- Check that your Supabase authentication is properly configured
- Verify that email auto-confirm is enabled in Supabase (Authentication > Settings)

### Authentication Flow Stuck
- Clear browser cookies and cache
- Check browser console for any errors
- Verify that your Google OAuth credentials are correct

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Review the Supabase logs in the dashboard
3. Verify all configuration steps were completed correctly

## Additional Resources

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
