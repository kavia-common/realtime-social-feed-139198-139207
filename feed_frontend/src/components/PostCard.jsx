import React, { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { FiHeart, FiMessageSquare, FiMoreHorizontal } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useSession } from '../context/SessionContext';

export default function PostCard({ post, onOpen }) {
  const { user } = useSession();
  const [optimisticLikes, setOptimisticLikes] = useState(0);

  const like = async () => {
    setOptimisticLikes(x => x + 1);
    const { error } = await supabase.rpc('like_post', { post_id_input: post.id, user_id_input: user.id });
    if (error) {
      console.error(error);
      setOptimisticLikes(x => x - 1);
    }
  };

  return (
    <div className="card" role="article" aria-label="Post">
      <div className="post-header">
        <div className="post-user">
          <div className="avatar">{(post?.profiles?.username || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{post?.profiles?.username || 'User'}</div>
            <div className="post-meta">{formatDistanceToNowStrict(new Date(post.created_at))} ago</div>
          </div>
        </div>
        <button aria-label="More" className="button secondary" style={{ padding: 8 }}>
          <FiMoreHorizontal />
        </button>
      </div>

      <div className="post-content">{post.content}</div>

      <div className="actions">
        <button className="button secondary" onClick={like} aria-label="Like">
          <FiHeart /> &nbsp; {(post.like_count || 0) + optimisticLikes}
        </button>
        <button className="button secondary" onClick={onOpen} aria-label="Open comments">
          <FiMessageSquare /> &nbsp; {post.comment_count || 0}
        </button>
      </div>
    </div>
  );
}
