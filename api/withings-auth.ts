import type { VercelRequest, VercelResponse } from './_types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Gate Withings access behind a code if configured
  const accessCode = process.env.WITHINGS_ACCESS_CODE;
  if (accessCode) {
    const provided = req.query.code as string;
    if (provided !== accessCode) {
      return res.status(403).json({ error: 'Invalid access code' });
    }
  }

  const clientId = process.env.WITHINGS_CLIENT_ID;
  const redirectUri = process.env.WITHINGS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Withings not configured' });
  }

  // Encode the caller's origin in the state param so the callback can redirect back correctly
  const callerOrigin = (req.query.origin as string) || '';
  const state = callerOrigin
    ? Buffer.from(callerOrigin).toString('base64url')
    : Math.random().toString(36).substring(2, 15);

  // Withings OAuth2 scopes: user.metrics (weight, body measurements), user.activity (steps, HR, sleep)
  const scope = 'user.metrics,user.activity';

  const authUrl = new URL('https://account.withings.com/oauth2_user/authorize2');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  return res.redirect(302, authUrl.toString());
}
