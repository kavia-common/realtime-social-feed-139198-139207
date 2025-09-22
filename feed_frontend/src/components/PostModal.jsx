import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../context/SessionContext';

// PUBLIC_INTERFACE
export default function PostModal({ postId, onClose }) {
  /** Modal showing a post with comments, with realtime subscription */
  const { user } = useSession();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: postData } = await supabase
        .from('posts')
        .select('*, profiles!inner(username)')
        .eq('id', postId)
        .single();

      const { data: commentData } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, profiles!inner(username)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!mounted) return;
      setPost(postData || null);
      setComments(commentData || []);
    };
    load();

    const channel = supabase
      .channel(`realtime:comments:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, payload => {
        setComments(prev => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new];
          if (payload.eventType === 'UPDATE') return prev.map(c => c.id === payload.new.id ? payload.new : c);
          if (payload.eventType === 'DELETE') return prev.filter(c => c.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const addComment = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      content,
      user_id: user.id
    });
    if (error) console.error(error);
  };

  if (!post) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Post</div>
          <button className="button ghost" onClick={onClose}>Close</button>
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700 }}>{post?.profiles?.username || 'User'}</div>
          <div style={{ marginTop: 6 }}>{post.content}</div>
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Comments</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {comments.length === 0 ? (
              <div>No comments yet</div>
            ) : comments.map(c => (
              <div key={c.id} style={{ borderBottom: '1px dashed #E5E7EB', paddingBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{c?.profiles?.username || 'User'}</div>
                <div style={{ marginTop: 4 }}>{c.content}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #E5E7EB' }}
              placeholder="Write a comment"
              value={text}
              onChange={(e)=>setText(e.target.value)}
            />
            <button className="button" onClick={addComment}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
