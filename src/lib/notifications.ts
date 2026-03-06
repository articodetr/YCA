import { supabase } from './supabase';

export interface TransactionalEmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendTransactionalEmails(messages: TransactionalEmailMessage[]) {
  const validMessages = messages.filter(message => String(message.to || '').trim());
  if (!validMessages.length) return { success: true };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages: validMessages }),
  });

  const raw = await response.text();
  let parsed: any = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed?.error || parsed?.failed?.[0]?.error || raw || 'Failed to send email');
  }

  return parsed;
}

export function buildSimpleEmailHtml({
  title,
  greeting,
  intro,
  details,
  closing,
}: {
  title: string;
  greeting: string;
  intro: string;
  details: Array<{ label: string; value: string }>;
  closing?: string;
}) {
  const detailRows = details
    .filter(item => item.value)
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${item.label}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${item.value}</td>
      </tr>
    `)
    .join('');
import { supabase } from './supabase';

export interface TransactionalEmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendTransactionalEmails(messages: TransactionalEmailMessage[]) {
  const validMessages = messages.filter(message => String(message.to || '').trim());
  if (!validMessages.length) return { success: true };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages: validMessages }),
  });

  const raw = await response.text();
  let parsed: any = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed?.error || parsed?.failed?.[0]?.error || raw || 'Failed to send email');
  }

  return parsed;
}

export function buildSimpleEmailHtml({
  title,
  greeting,
  intro,
  details,
  closing,
}: {
  title: string;
  greeting: string;
  intro: string;
  details: Array<{ label: string; value: string }>;
  closing?: string;
}) {
  const detailRows = details
    .filter(item => item.value)
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${item.label}</td>
        <td style="padding:8px 12px;border:1px solid #e5e7eb;">${item.value}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6;">
      <div style="background:#065f46;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h2 style="margin:0;font-size:22px;">${title}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p style="margin-top:0;">${greeting}</p>
        <p>${intro}</p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">${detailRows}</table>
        ${closing ? `<p style="margin-bottom:0;">${closing}</p>` : ''}
      </div>
    </div>
  `;
}

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6;">
      <div style="background:#065f46;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h2 style="margin:0;font-size:22px;">${title}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p style="margin-top:0;">${greeting}</p>
        <p>${intro}</p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;">${detailRows}</table>
        ${closing ? `<p style="margin-bottom:0;">${closing}</p>` : ''}
      </div>
    </div>
  `;
}
