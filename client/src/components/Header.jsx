import { useEffect, useState } from 'react';

const LINKS = [
  ['about', 'About'],
  ['work', 'Experience'],
  ['stack', 'Stack'],
  ['contact', 'Contact'],
];

/** Highlights the section currently in view (scroll-spy). */
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, ratio = 0;
      visible.forEach((r, id) => { if (r > ratio) { ratio = r; best = id; } });
      setActive(ratio > 0 ? best : null);
    }, { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join()]);
  return active;
}

export default function Header({ profile }) {
  const active = useActiveSection(LINKS.map(([id]) => id));
  return (
    <header className="top"><div className="wrap">
      <a className="mark" href="#top" aria-label="Back to top">{profile.firstName?.[0]}<span>.</span>{profile.lastName?.[0]}</a>
      <nav aria-label="Sections">
        {LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>
        ))}
      </nav>
    </div></header>
  );
}
