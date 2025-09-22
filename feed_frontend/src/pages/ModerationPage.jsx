import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// PUBLIC_INTERFACE
export default function ModerationPage() {
  /** Moderation queue to approve or reject posts */
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id, profiles!inner(username), status')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (!mounted) return;
      setQueue(data || []);
    };
    load();

    const ch = supabase
      .channel('realtime:moderation')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        setQueue(prev => {
          // Keep only 'pending'
          if (payload.eventType === 'INSERT') {
            return payload.new.status === 'pending' ? [...prev, payload.new] : prev;
          }
          if (payload.eventType === 'UPDATE') {
            const idx = prev.findIndex(p => p.id === payload.new.id);
            if (payload.new.status === 'pending') {
              if (idx === -1) return [...prev, payload.new];
              const next = [...prev];
              next[idx] = payload.new;
              return next;
            } else {
              // remove from queue if resolved
              return idx >= 0 ? prev.filter(p => p.id !== payload.new.id) : prev;
            }
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter(p => p.id !== payload.old.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      mounted = false;
    };
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('posts').update({ status }).eq('id', id);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card">
        <div style={{ fontWeight: 800, fontSize: 18 }}>Moderation Queue</div>
        <div style={{ color: '#6B7280' }}>Review content and approve or reject.</div>
      </div>

      {queue.length === 0 ? (
        <div className="card">No items pending.</div>
      ) : queue.map(p => (
        <div className="card" key={p.id}>
          <div style={{ fontWeight: 700 }}>{p?.profiles?.username || 'User'}</div>
          <div style={{ marginTop: 8 }}>{p.content}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="button" onClick={() => updateStatus(p.id, 'approved')}>Approve</button>
            <button className="button secondary" onClick={() => updateStatus(p.id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
