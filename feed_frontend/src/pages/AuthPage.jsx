import React, { useState } from 'react';
import { signInWithMagicLink } from '../lib/supabase';

// PUBLIC_INTERFACE
export default function AuthPage() {
  /** Authentication page: magic-link email sign in */
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 20 }}>
      <div className="card" style={{ width: 420, maxWidth: '100%' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <div className="brand-bubble">O</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>OceanFeed</div>
        </div>

        {sent ? (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Check your email</div>
            <div style={{ color: '#6B7280' }}>
              We sent a magic sign-in link to <strong>{email}</strong>.
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ color: '#6B7280' }}>
              Sign in with your email. We’ll send a magic link.
            </div>
            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              type="email"
              placeholder="name@company.com"
              aria-label="Email"
              style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 12, border: '1px solid #E5E7EB' }}
            />
            {!!error && <div style={{ color: '#EF4444', marginTop: 8 }}>{error}</div>}
            <button className="button" style={{ width: '100%', marginTop: 10 }} type="submit">Send magic link</button>
          </form>
        )}
      </div>
    </div>
  );
}
