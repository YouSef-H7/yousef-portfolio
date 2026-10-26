import { useState } from 'react';
import { api } from '../../api.js';
import { Field, PasswordInput } from './ui.jsx';

export default function Settings({ title }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== again) return setMsg({ type: 'err', text: 'The new passwords do not match' });
    setBusy(true);
    try {
      await api.changePassword(current, next);
      setMsg({ type: 'ok', text: 'Password changed.' });
      setCurrent(''); setNext(''); setAgain('');
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-head"><h1>{title}</h1></header>
      <form className="adm-narrow" onSubmit={submit}>
        <h2 className="adm-h2">Change password</h2>
        <Field label="Current password"><PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" required /></Field>
        <Field label="New password" hint="At least 10 characters"><PasswordInput value={next} onChange={setNext} autoComplete="new-password" minLength={10} required /></Field>
        <Field label="Repeat new password"><PasswordInput value={again} onChange={setAgain} autoComplete="new-password" required /></Field>
        {msg && <div className={msg.type === 'ok' ? 'adm-status ok' : 'adm-error'} role="alert">{msg.text}</div>}
        <button className="btn warm" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
      </form>
      <section className="adm-narrow">
        <h2 className="adm-h2">About this panel</h2>
        <p className="adm-muted">Every section keeps its last 20 versions; use <b>Version history</b> at the bottom of a section to roll back. Content is stored in SQLite under the server's data directory and photos under <code>uploads/</code>. Back up that directory and you have everything.</p>
      </section>
    </div>
  );
}
