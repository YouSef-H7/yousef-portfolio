import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { PasswordInput } from './ui.jsx';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onLogin(await api.login(username, password));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="glow" aria-hidden="true" />
      <form className="adm-card" onSubmit={submit} noValidate>
        <Link to="/" className="mark">Y<span>.</span>A</Link>
        <h1>Sign in</h1>
        <p className="adm-muted">Portfolio control panel</p>
        <label>Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>Password
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" autoFocus required />
        </label>
        {error && <div className="adm-error" role="alert">{error}</div>}
        <button className="btn warm" type="submit" disabled={busy || !password} aria-busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
