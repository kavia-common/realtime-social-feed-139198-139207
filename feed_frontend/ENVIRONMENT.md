# Environment configuration

Required variables (set via deployment environment, do not commit secrets):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These are mapped to your Supabase project.

Where to put .env (development):
- Create a file feed_frontend/.env using .env.example as a template.
- Add your values:
  REACT_APP_SUPABASE_URL=...
  REACT_APP_SUPABASE_KEY=...
- Stop and restart the dev server after any changes to .env. CRA does not hot-reload env files.

Production/CI:
- Set the same variables in your deployment environment prior to building the app (they are compiled at build time).

Troubleshooting:
- If you see "Supabase client initialization failed" or "supabaseUrl is required":
  1) Confirm feed_frontend/.env exists and contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.
  2) Ensure you restarted `npm start` after editing .env.
  3) Avoid setting variables inline in npm scripts; CRA reads env at process start.

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

