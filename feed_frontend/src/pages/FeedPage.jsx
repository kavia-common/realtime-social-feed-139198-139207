import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../context/SessionContext';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';

// PUBLIC_INTERFACE
export default function FeedPage() {
  /** Main feed page: composer, feed list with realtime updates */
  const { user } = useSession();
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const canPost = useMemo(() => text.trim().length > 0 && text.trim().length <= 500, [text]);

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id, profiles!inner(username, avatar_url), like_count, comment_count, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!mounted) return;
      if (error) {
        console.error(error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();

    const channel = supabase
      .channel('realtime:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        setPosts(prev => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.status !== 'approved') return prev;
            return [payload.new, ...prev];
          } else if (payload.eventType === 'UPDATE') {
            const idx = prev.findIndex(p => p.id === payload.new.id);
            if (idx === -1) return prev;
            const updated = [...prev];
            if (payload.new.status === 'rejected') {
              updated.splice(idx, 1);
              return updated;
            }
            updated[idx] = { ...updated[idx], ...payload.new };
            return updated;
          } else if (payload.eventType === 'DELETE') {
            return prev.filter(p => p.id !== payload.old.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const createPost = async () => {
    if (!canPost) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url').eq('id', user.id).single();

    const { error } = await supabase.from('posts').insert({
      content: text.trim(),
      user_id: user.id,
      status: 'pending' // moderation pending
    });
    if (error) console.error(error);
    setText('');
  };

  return (
    <>
      <div className="composer card">
        <textarea
          placeholder="Share your thoughts..."
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Create a post"
        />
        <div className="row">
          <div style={{ color: '#6B7280', fontSize: 12 }}>{text.trim().length}/500</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button ghost" onClick={() => setText('')}>Clear</button>
            <button className="button" onClick={createPost} disabled={!canPost} aria-disabled={!canPost}>
              Post
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading feed…</div>
      ) : posts.length === 0 ? (
        <div className="card">No posts yet. Be the first to post!</div>
      ) : (
        posts.map(p => (
          <PostCard key={p.id} post={p} onOpen={() => setSelected(p)} />
        ))
      )}

      {selected && (
        <PostModal postId={selected.id} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
