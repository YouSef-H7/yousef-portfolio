import { useEffect, useRef, useState } from 'react';

export default function Experience({ experience }) {
  const roles = experience.roles || [];
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const tabRefs = useRef([]);
  const role = roles[Math.min(active, roles.length - 1)];

  useEffect(() => setAnimKey((k) => k + 1), [active]);

  if (!roles.length) return null;

  const select = (i, focus = false) => {
    setActive(i);
    if (focus) tabRefs.current[i]?.focus();
  };
  const onKey = (e, i) => {
    const n = roles.length;
    const map = { ArrowDown: (i + 1) % n, ArrowRight: (i + 1) % n, ArrowUp: (i + n - 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 };
    if (map[e.key] === undefined) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <section id="work"><div className="wrap split">
      <div>
        <div className="eyebrow">Experience</div>
        <h2 className="sec-title">{experience.heading}</h2>
        <ul className="roles" role="tablist" aria-label="Roles">
          {roles.map((r, i) => (
            <li key={r.id}>
              <button role="tab" id={`tab-${r.id}`} ref={(el) => (tabRefs.current[i] = el)}
                aria-selected={i === active} aria-controls="role-panel" tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)} onKeyDown={(e) => onKey(e, i)}>
                <span className="yr">{r.year}</span>
                <span className="nm">{r.title}<span className="org">{r.org}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel" id="role-panel" role="tabpanel" aria-labelledby={`tab-${role.id}`} aria-live="polite">
        <div className="panel-body swap" key={animKey}>
          <span className={`state ${role.status === 'Running' ? 'live' : ''}`}>{role.status}</span>
          <h3>{role.title}</h3>
          <div className="where">{role.where}</div>
          <ol>{role.points.map((p, i) => <li key={i}><span>{p}</span></li>)}</ol>
          {role.tags.length > 0 && <div className="chips">{role.tags.map((t) => <span key={t}>{t}</span>)}</div>}
        </div>
      </div>
    </div></section>
  );
}
