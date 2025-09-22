import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiCompass, FiHome, FiLogOut, FiShield, FiUser } from 'react-icons/fi';
import { useSession } from '../context/SessionContext';
import { signOut } from '../lib/supabase';

export default function Layout() {
  const { user } = useSession();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="app-shell">
      <aside className="nav">
        <div className="brand">
          <div className="brand-bubble">O</div>
          <div className="brand-title">OceanFeed</div>
        </div>
        <div className="search" role="search">
          <span role="img" aria-label="search">🔎</span>
          <input placeholder="Search" aria-label="Search posts" />
        </div>

        <div className="nav-section" aria-label="Navigation">
          <NavLink to="/" className="nav-item">
            <FiHome /> <span className="label">Home</span>
          </NavLink>
          <NavLink to={`/profile/${user?.id}`} className="nav-item">
            <FiUser /> <span className="label">Profile</span>
          </NavLink>
          <NavLink to="/moderation" className="nav-item">
            <FiShield /> <span className="label">Moderation</span>
          </NavLink>
          <a href="https://explore" className="nav-item" onClick={(e)=>e.preventDefault()}>
            <FiCompass /> <span className="label">Explore</span>
          </a>
        </div>

        <div style={{ marginTop: 'auto' }} className="nav-section">
          <button onClick={logout} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <FiLogOut /> <span className="label">Logout</span>
          </button>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
            Signed in as <strong>{user?.email}</strong>
          </div>
        </div>
      </aside>

      <main className="feed">
        <Outlet />
      </main>

      <aside className="sidebar">
        <div className="card">
          <div className="panel-title">Who to follow</div>
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            <Suggestion username="ocean_pro" />
            <Suggestion username="amber_wave" />
            <Suggestion username="blue_whale" />
          </div>
        </div>

        <div className="card">
          <div className="panel-title">Trends</div>
          <div className="chips" style={{ marginTop: 8 }}>
            <span className="chip">#ocean</span>
            <span className="chip">#design</span>
            <span className="chip">#react</span>
            <span className="chip">#supabase</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Suggestion({ username }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="avatar">{username.charAt(0).toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>@{username}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>Follows you</div>
      </div>
      <button className="button secondary">Follow</button>
    </div>
  );
}
