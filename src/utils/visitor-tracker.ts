import { supabase } from '@/lib/supabase';

let sessionId: string;

// Generate or get session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  if (!sessionId) {
    sessionId = localStorage.getItem('visitor_session_id') || generateSessionId();
    localStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function trackPageView(pagePath: string) {
  if (typeof window === 'undefined') return;

  try {
    const { data } = await fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .catch(() => ({ ip: 'unknown' }));

    await supabase.from('visitors').insert({
      page_path: pagePath,
      visitor_ip: data?.ip || 'unknown',
      user_agent: navigator.userAgent,
      referer: document.referrer,
      session_id: getSessionId(),
    });
  } catch (error) {
    console.log('Visitor tracking skipped');
  }
}
