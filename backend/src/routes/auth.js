const express = require('express');
const { createSupabaseClient } = require('../supabase');
const config = require('../config');
const { getBearerToken, requireAccessToken } = require('../middleware/auth');
const { sendSupabaseError } = require('../lib/response');
const { isSmtpConfigured, sendWelcomeTestEmail } = require('../lib/mailer');

const router = express.Router();

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

async function resolveLoginEmail(login) {
  const client = createSupabaseClient();
  const { data, error } = await client.rpc('resolve_login_email', { p_username: login });
  if (error) throw error;
  return normalizeString(data);
}

router.post('/login', async (req, res) => {
  try {
    const login = normalizeString(req.body?.login);
    const password = normalizeString(req.body?.password);

    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required.' });
    }

    const resolvedEmail = await resolveLoginEmail(login);
    if (!resolvedEmail) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const client = createSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (error) return sendSupabaseError(res, error, 401);

    return res.json({
      message: 'Login successful.',
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const login = normalizeString(req.body?.login);
    const redirectTo = normalizeString(req.body?.redirectTo) || 'http://localhost:5173/reset-password';

    if (!login) {
      return res.status(400).json({ error: 'login is required.' });
    }

    const resolvedEmail = login.includes('@') ? login.toLowerCase() : await resolveLoginEmail(login);
    if (!resolvedEmail) {
      return res.status(404).json({ error: 'No active staff account found for that login.' });
    }

    const client = createSupabaseClient();
    const { error } = await client.auth.resetPasswordForEmail(resolvedEmail, { redirectTo });

    if (error) return sendSupabaseError(res, error);

    return res.json({
      message: 'Verification code sent to email.',
      email: resolvedEmail,
      redirectTo,
    });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.post('/verify-reset-code', async (req, res) => {
  try {
    const login = normalizeString(req.body?.login);
    const code = normalizeString(req.body?.code);

    if (!login || !code) {
      return res.status(400).json({ error: 'login and code are required.' });
    }

    const resolvedEmail = login.includes('@') ? login.toLowerCase() : await resolveLoginEmail(login);
    if (!resolvedEmail) {
      return res.status(404).json({ error: 'No active staff account found for that login.' });
    }

    const client = createSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
      email: resolvedEmail,
      token: code,
      type: 'recovery',
    });

    if (error || !data?.session?.access_token) return sendSupabaseError(res, error || { message: 'Invalid code.' }, 401);

    return res.json({
      message: 'Code verified.',
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.post('/refresh-session', async (req, res) => {
  try {
    const refreshToken = normalizeString(req.body?.refreshToken);
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required.' });
    }

    const client = createSupabaseClient();
    const { data, error } = await client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) return sendSupabaseError(res, error, 401);

    return res.json({
      message: 'Session refreshed.',
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

router.get('/me', requireAccessToken, async (req, res) => {
  try {
    const client = createSupabaseClient({ accessToken: req.accessToken });
    const { data, error } = await client.auth.getUser();

    if (error) return sendSupabaseError(res, error, 401);

    return res.json({ user: data.user });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

router.post('/update-password', requireAccessToken, async (req, res) => {
  try {
    const newPassword = normalizeString(req.body?.newPassword);
    if (!newPassword) {
      return res.status(400).json({ error: 'newPassword is required.' });
    }

    const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${req.accessToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.msg || payload?.message || 'Unable to update password.',
        code: payload?.error_code || null,
        details: payload?.error_description || null,
        hint: null,
      });
    }

    return res.json({
      message: 'Password updated successfully.',
      user: payload?.user || null,
    });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

router.post('/admin-update-user-email', requireAccessToken, async (req, res) => {
  try {
    if (!config.supabaseServiceRoleKey) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for admin email updates.' });
    }

    const userId = normalizeString(req.body?.userId);
    const nextEmail = normalizeString(req.body?.email).toLowerCase();

    if (!userId || !nextEmail) {
      return res.status(400).json({ error: 'userId and email are required.' });
    }

    const requesterClient = createSupabaseClient({ accessToken: req.accessToken });
    const { data: requesterUserData, error: requesterUserError } = await requesterClient.auth.getUser();
    if (requesterUserError || !requesterUserData?.user?.id) {
      return sendSupabaseError(res, requesterUserError || { message: 'Unable to resolve authenticated user.' }, 401);
    }

    const serviceClient = createSupabaseClient({ useServiceRole: true });

    const { data: requesterProfile, error: requesterProfileError } = await serviceClient
      .from('staff_profiles')
      .select('user_id, role, is_active')
      .eq('user_id', requesterUserData.user.id)
      .maybeSingle();

    if (requesterProfileError) return sendSupabaseError(res, requesterProfileError, 403);
    if (!requesterProfile || !requesterProfile.is_active || requesterProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required.' });
    }

    const { data: targetProfile, error: targetProfileError } = await serviceClient
      .from('staff_profiles')
      .select('user_id, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (targetProfileError) return sendSupabaseError(res, targetProfileError);
    if (!targetProfile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (String(targetProfile.email || '').toLowerCase() === nextEmail) {
      return res.json({ message: 'Email unchanged.' });
    }

    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(userId, {
      email: nextEmail,
      email_confirm: true,
    });
    if (authUpdateError) return sendSupabaseError(res, authUpdateError);

    const { error: profileUpdateError } = await serviceClient
      .from('staff_profiles')
      .update({ email: nextEmail })
      .eq('user_id', userId);
    if (profileUpdateError) return sendSupabaseError(res, profileUpdateError);

    return res.json({ message: 'User email updated successfully.' });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

router.post('/admin-send-user-welcome-email', requireAccessToken, async (req, res) => {
  try {
    const email = normalizeString(req.body?.email).toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'email is required.' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const requesterClient = createSupabaseClient({ accessToken: req.accessToken });
    const { data: requesterUserData, error: requesterUserError } = await requesterClient.auth.getUser();
    if (requesterUserError || !requesterUserData?.user?.id) {
      return sendSupabaseError(res, requesterUserError || { message: 'Unable to resolve authenticated user.' }, 401);
    }

    const { data: requesterProfile, error: requesterProfileError } = await requesterClient
      .from('staff_profiles')
      .select('user_id, role, is_active')
      .eq('user_id', requesterUserData.user.id)
      .maybeSingle();

    if (requesterProfileError) return sendSupabaseError(res, requesterProfileError, 403);
    if (!requesterProfile || !requesterProfile.is_active || requesterProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required.' });
    }

    if (!isSmtpConfigured()) {
      return res.status(500).json({
        error: 'SMTP is not configured on backend. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL in backend/.env.',
      });
    }

    await sendWelcomeTestEmail({
      toEmail: email,
      requestedBy: requesterProfile.full_name || requesterUserData.user.email || 'Admin',
    });

    return res.json({
      message: 'Test email sent.',
      email,
    });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

router.post('/logout', async (req, res) => {
  try {
    const accessToken = getBearerToken(req);
    if (!accessToken) {
      return res.status(400).json({
        error: 'Missing bearer token. Add Authorization: Bearer <access_token>.',
      });
    }

    const client = createSupabaseClient({ accessToken });
    const { error } = await client.auth.signOut();
    if (error) return sendSupabaseError(res, error);

    return res.json({ message: 'Logged out.' });
  } catch (error) {
    return sendSupabaseError(res, error, 500);
  }
});

module.exports = router;
