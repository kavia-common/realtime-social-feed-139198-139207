# Supabase Integration for OceanFeed (feed_frontend)

This frontend uses Supabase for:
- Authentication (email magic link)
- Database (profiles, posts, comments)
- Realtime subscriptions (posts, comments)
- Moderation (status field on posts)

Environment variables (configure in deployment):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Auth:
- Magic link sign-in via supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: SITE_URL } })
- We set emailRedirectTo dynamically to window.location.origin in the client.

Schema (recommended):
- Table profiles: id uuid primary key references auth.users(id), username text unique, avatar_url text, bio text
- Table posts: id uuid default gen_random_uuid(), user_id uuid references profiles(id), content text, created_at timestamptz default now(), like_count int default 0, comment_count int default 0, status text default 'pending' check (status in ('pending','approved','rejected'))
- Table comments: id uuid default gen_random_uuid(), post_id uuid references posts(id) on delete cascade, user_id uuid references profiles(id), content text, created_at timestamptz default now()
- Table post_likes: post_id uuid references posts(id) on delete cascade, user_id uuid references profiles(id), primary key (post_id, user_id)

Sample RPC for likes:

create or replace function like_post(post_id_input uuid, user_id_input uuid)
returns void
language plpgsql
as $$
begin
  insert into post_likes (post_id, user_id)
  values (post_id_input, user_id_input)
  on conflict do nothing;

  update posts
  set like_count = (
    select count(*)::int from post_likes where post_id = post_id_input
  )
  where id = post_id_input;
end; $$;

Policies (example, adjust to your needs):
- Enable RLS on posts, comments, profiles, post_likes
- Allow authenticated users to insert/select posts where status in ('approved') for feed; owners can manage their own rows.
- Moderation: create a role moderator which can update posts.status.

Realtime:
- Enable Realtime on posts and comments.
- Frontend subscribes to: posts (all) and comments filtered by post_id.

