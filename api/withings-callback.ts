import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Decode the caller's origin from the state param (if present)
  const stateParam = req.query.state as string;
  let callerOrigin = '';
  if (stateParam) {
    try {
      callerOrigin = Buffer.from(stateParam, 'base64url').toString();
      // Validate it looks like an origin (http/https URL)
      if (!callerOrigin.startsWith('http')) callerOrigin = '';
    } catch {
      callerOrigin = '';
    }
  }
  const redirectBase = callerOrigin || '';

  const clientId = process.env.WITHINGS_CLIENT_ID!;
  const clientSecret = process.env.WITHINGS_CLIENT_SECRET!;
  const redirectUri = process.env.WITHINGS_REDIRECT_URI!;

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'requesttoken',
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.status !== 0 || !data.body) {
      console.error('Withings token error:', data);
      return res.redirect(302, `${redirectBase}/profile?withings=error&msg=${encodeURIComponent(data.error || 'Token exchange failed')}`);
    }

    const { access_token, refresh_token, expires_in, userid } = data.body;
    const expiry = new Date(Date.now() + expires_in * 1000).toISOString();

    // Redirect back to app with tokens
    // The client will read these and store in IndexedDB, then clear the URL
    const params = new URLSearchParams({
      withings: 'success',
      access_token,
      refresh_token,
      expiry,
      userid: String(userid),
    });

    return res.redirect(302, `${redirectBase}/profile?${params.toString()}`);
  } catch (error) {
    console.error('Withings callback error:', error);
    return res.redirect(302, `${redirectBase}/profile?withings=error&msg=${encodeURIComponent('Connection failed')}`);
  }
}
