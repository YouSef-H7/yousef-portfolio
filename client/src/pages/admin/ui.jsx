import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useContent } from '../../content.jsx';
import Icon from './Icon.jsx';

/** Shared across the panel so the sidebar can warn before leaving a section with unsaved edits. */
export const unsaved = { current: false };

/** Shared editing state for one content section: local draft, dirty flag, save, revert, history. */
export function useSection(section) {
  const { content, patch } = useContent();
  const saved = content[section];
  const [draft, setDraft] = useState(saved);
  const [status, setStatus] = useState(null); // {type:'ok'|'err', text}
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    unsaved.current = dirty;
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => { window.removeEventListener('beforeunload', h); unsaved.current = false; };
  }, [dirty]);

  const flash = (type, text) => {
    setStatus({ type, text });
    if (type === 'ok') setTimeout(() => setStatus(null), 3000);
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await api.save(section, draft);
      patch(section, res.data);
      setDraft(res.data);
      flash('ok', 'Saved. The site is updated.');
    } catch (e) {
      if (e.status === 401) window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: { status: 401 } }));
      flash('err', e.message);
    } finally {
      setBusy(false);
    }
  };

  const revert = () => {
    if (!confirm('Discard your unsaved changes?')) return;
    setDraft(saved);
    setStatus(null);
  };
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const restore = async (id) => {
    setBusy(true);
    try {
      const res = await api.restore(id);
      patch(section, res.data);
      setDraft(res.data);
      flash('ok', 'Previous version restored.');
    } catch (e) {
      flash('err', e.message);
    } finally {
      setBusy(false);
    }
  };

  return { sectionName: section, draft, setDraft, set, save, revert, restore, dirty, busy, status };
}

export function Page({ title, intro, s, children }) {
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>{title}</h1>
        {intro && <p className="adm-muted">{intro}</p>}
      </header>
      {children}
      {s && <History s={s} />}
      {s && <SaveBar s={s} />}
    </div>
  );
}

/** Sticks to the bottom of the viewport while the section is longer than the screen. */
export function SaveBar({ s }) {
  return (
    <div className={`adm-savebar ${s.dirty ? 'dirty' : ''}`}>
      <span className={`adm-status ${s.status?.type || ''}`} role="status" aria-live="polite">
        {s.status ? s.status.text : s.dirty ? 'Unsaved changes' : 'All changes saved'}
      </span>
      <div className="adm-row">
        <button type="button" className="btn ghost" onClick={s.revert} disabled={!s.dirty || s.busy}>Discard</button>
        <button type="button" className="btn warm" onClick={s.save} disabled={!s.dirty || s.busy} aria-busy={s.busy}>
          {s.busy ? 'Saving…' : 'Save & publish'}
        </button>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="adm-field">
      <span className="adm-label">{label}{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  );
}

export function Text({ value, onChange, ...rest }) {
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function Area({ value, onChange, rows = 3, ...rest }) {
  return <textarea value={value ?? ''} rows={rows} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function PasswordInput({ value, onChange, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <span className="adm-pw">
      <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      <button type="button" className="adm-iconbtn" onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </span>
  );
}

/** Chips input bound to an array of strings. Enter or comma adds; each chip has a remove button. */
export function TagList({ values, onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...values, ...parts.filter((p) => !values.includes(p))]);
    setText('');
  };
  return (
    <div className="adm-tags">
      {values.map((v, i) => (
        <span key={v} className="adm-chip">{v}
          <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((_, j) => j !== i))}><Icon name="close" size={12} /></button>
        </span>
      ))}
      <input value={text} placeholder={placeholder} aria-label="Add item" onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} onBlur={add} />
    </div>
  );
}

/** Ordered list editor: renders `row(item, update)` for each item with move/remove controls. */
export function ListEditor({ items, onChange, row, blank, addLabel = 'Add', summary, emptyText = 'Nothing here yet.' }) {
  const update = (i, next) => onChange(items.map((it, j) => (j === i ? next : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <div className="adm-list">
      {items.length === 0 && <p className="adm-empty">{emptyText}</p>}
      {items.map((item, i) => (
        <details className="adm-item" key={item.id ?? i} open={items.length <= 3 || undefined}>
          <summary>
            <Icon name="chevron" size={14} />
            <span className="adm-item-title">{summary ? summary(item) : `Item ${i + 1}`}</span>
            <span className="adm-item-tools" onClick={(e) => e.preventDefault()}>
              <button type="button" className="adm-iconbtn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" /></button>
              <button type="button" className="adm-iconbtn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon name="down" /></button>
              <button type="button" className="adm-iconbtn danger" aria-label="Remove"
                onClick={() => { if (confirm('Remove this item? You can still Discard before saving.')) onChange(items.filter((_, j) => j !== i)); }}><Icon name="trash" /></button>
            </span>
          </summary>
          <div className="adm-item-body">{row(item, (next) => update(i, next), i)}</div>
        </details>
      ))}
      <button type="button" className="btn ghost" onClick={() => onChange([...items, blank()])}><Icon name="plus" /> {addLabel}</button>
    </div>
  );
}

function History({ s }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(null);
  useEffect(() => {
    if (open) api.history(s.sectionName).then((r) => setList(r.history), () => setList([]));
  }, [open, s.sectionName, s.status]);
  return (
    <details className="adm-history" onToggle={(e) => setOpen(e.target.open)}>
      <summary><Icon name="chevron" size={14} /> Version history</summary>
      {list === null ? <p className="adm-muted">Loading…</p> : list.length === 0 ? <p className="adm-muted">No earlier versions yet. One is kept each time you save.</p> : (
        <ul>
          {list.map((h) => (
            <li key={h.id}>
              <span>{new Date(h.saved_at + 'Z').toLocaleString()}</span>
              <button type="button" className="adm-link" disabled={s.busy}
                onClick={() => { if (confirm('Restore this version? The current one is kept in history.')) s.restore(h.id); }}>Restore</button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

export const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || `role-${Date.now().toString(36)}`;
