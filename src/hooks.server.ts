import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get(auth.sessionCookieName);

  // allow access to auth routes without session
  if (event.url.pathname === '/login' || event.url.pathname === '/register') {
    if (sessionToken) {
      // if already logged in, redirect to home
      throw redirect(303, '/');
    }
    return resolve(event);
  }

  // check for session on all other routes
  if (!sessionToken) {
    event.locals.user = null;
    event.locals.session = null;
    // redirect to login if no session
    throw redirect(303, '/login');
  }

  const { session, user } = await auth.validateSessionToken(sessionToken);
  if (session) {
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    auth.deleteSessionTokenCookie(event);
    // redirect to login if invalid session
    throw redirect(303, '/login');
  }

  event.locals.user = user;
  event.locals.session = session;
  return resolve(event);
};

export const handle: Handle = handleAuth;
