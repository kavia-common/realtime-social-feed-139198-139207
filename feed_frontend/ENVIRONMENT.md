# Environment configuration

Required variables (set via deployment environment, do not commit secrets):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These are mapped to your Supabase project.

# Supabase schema expectations

Tables:
- profiles: { id: uuid PK references auth.users, username text, avatar_url text, bio text }
- posts: { id: uuid PK, content text, user_id uuid references profiles(id), created_at timestamptz default now(), like_count int default 0, comment_count int default 0, status text default 'pending' check in ('pending','approved','rejected') }
- comments: { id: uuid PK, post_id uuid references posts(id), content text, user_id uuid references profiles(id), created_at timestamptz default now() }

Realtime should be enabled on tables.

RPC (SQL function):
- like_post(post_id_input uuid, user_id_input uuid) returns void
  Should upsert into a post_likes join table and increment posts.like_count safely.

Policies should permit:
- Authenticated users to select/insert posts/comments
- Only owner can delete own posts/comments
- Moderation updates on posts.status by a role you define

