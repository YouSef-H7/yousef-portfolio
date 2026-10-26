import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useContent } from '../../content.jsx';
import Login from './Login.jsx';
import ProfileEditor from './ProfileEditor.jsx';
import AboutEditor from './AboutEditor.jsx';
import PhotosEditor from './PhotosEditor.jsx';
import ExperienceEditor from './ExperienceEditor.jsx';
import StackEditor from './StackEditor.jsx';
import CertificationsEditor from './CertificationsEditor.jsx';
import EducationEditor from './EducationEditor.jsx';
import ContactEditor from './ContactEditor.jsx';
import SeoEditor from './SeoEditor.jsx';
import Settings from './Settings.jsx';
import Icon from './Icon.jsx';
import { unsaved } from './ui.jsx';

const NAV = [
  ['profile', 'Hero & profile', ProfileEditor],
  ['about', 'About', AboutEditor],
  ['photos', 'Photos', PhotosEditor],
  ['experience', 'Experience', ExperienceEditor],
  ['stack', 'Stack', StackEditor],
  ['certifications', 'Certifications', CertificationsEditor],
  ['education', 'Education', EducationEditor],
  ['contact', 'Contact', ContactEditor],
  ['seo', 'SEO', SeoEditor],
  ['settings', 'Settings', Settings],
];

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined = checking
  const { content, refresh, updatedAt } = useContent();

  useEffect(() => {
    document.title = 'Admin · Portfolio';
    api.me().then((u) => setUser(u), () => setUser(null));
  }, []);

  useEffect(() => {
    // An expired session should bounce to the login form on the next failed request.
    const onUnauthorized = (e) => e.detail?.status === 401 && setUser(null);
    window.addEventListener('api:unauthorized', onUnauthorized);
    return () => window.removeEventListener('api:unauthorized', onUnauthorized);
  }, []);

  if (user === undefined) return <div className="adm-loading">Checking session…</div>;
  if (!user) return <Login onLogin={(u) => { setUser(u); refresh(); }} />;
  if (!content) return <div className="adm-loading">Loading content…</div>;

  const guard = (e) => {
    if (unsaved.current && !confirm('You have unsaved changes in this section. Leave without saving?')) e.preventDefault();
  };
  const logout = async () => {
    if (unsaved.current && !confirm('You have unsaved changes. Sign out anyway?')) return;
    await api.logout();
    setUser(null);
  };

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <Link to="/" className="mark">Y<span>.</span>A</Link>
          <span className="adm-tag">Control panel</span>
        </div>
        <nav aria-label="Admin sections">
          {NAV.map(([key, label]) => (
            <NavLink key={key} to={`/admin/${key}`} onClick={guard} className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>
          ))}
        </nav>
        <div className="adm-foot">
          <a href="/" target="_blank" rel="noopener">View site <Icon name="external" size={14} /></a>
          <span className="adm-user">{user.username}</span>
          <button type="button" className="adm-link" onClick={logout}>Sign out</button>
          {updatedAt && <small>Last change {new Date(updatedAt + 'Z').toLocaleString()}</small>}
        </div>
      </aside>
      <main className="adm-main">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          {NAV.map(([key, label, Comp]) => (
            <Route key={key} path={key} element={<Comp section={key} title={label} />} />
          ))}
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  );
}
