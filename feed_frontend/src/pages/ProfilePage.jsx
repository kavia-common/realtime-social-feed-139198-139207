import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

// PUBLIC_INTERFACE
export default function ProfilePage() {
  /** User profile page listing their posts */
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id, profiles!inner(username), like_count, comment_count, status')
        .eq('user_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      setProfile(p || null);
      setPosts(postsData || []);
    };
    load();

    const ch = supabase
      .channel(`realtime:posts:profile:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${id}` }, payload => {
        setPosts(prev => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.status !== 'approved') return prev;
            return [payload.new, ...prev];
          }
          if (payload.eventType === 'UPDATE') {
            const idx = prev.findIndex(p => p.id === payload.new.id);
            if (idx === -1) return prev;
            const next = [...prev];
            if (payload.new.status === 'rejected') {
              next.splice(idx, 1);
              return next;
            }
            next[idx] = { ...next[idx], ...payload.new };
            return next;
          }
          if (payload.eventType === 'DELETE') return prev.filter(p => p.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      mounted = false;
    };
  }, [id]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="avatar">{(profile?.username || 'U').charAt(0).toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{profile?.username || 'User'}</div>
          <div style={{ color: '#6B7280' }}>{profile?.bio || 'No bio yet.'}</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="card">No posts yet.</div>
      ) : posts.map(p => (
        <PostCard key={p.id} post={p} onOpen={() => {}} />
      ))}
    </div>
  );
}
