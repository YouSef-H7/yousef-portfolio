import { Rich } from '../rich.jsx';
import Photo from './Photo.jsx';

export default function Hero({ profile, photo }) {
  return (
    <section className="hero" id="top"><div className="wrap">
      <div>
        <div className="eyebrow rise">{profile.eyebrow}</div>
        <h1 className="rise d1">{profile.firstName}<span className="second">{profile.lastName}</span></h1>
        <p className="lede rise d2"><Rich text={profile.lede} /></p>
        <div className="actions rise d3">
          <a className="btn warm" href="#contact">{profile.primaryCta}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
          <a className="btn ghost" href="#work">{profile.secondaryCta}</a>
        </div>
      </div>
      <div className="portrait rise d4">
        <Photo src={photo} alt={`Portrait of ${profile.firstName} ${profile.lastName}`} width={1100} height={1375} priority
          fallback={<span className="mono">{profile.firstName?.[0]}<span>.</span>{profile.lastName?.[0]}</span>} />
        {profile.badgeText && (
          <div className="badge">
            <span className="now">{profile.badgeLive && <i />}{profile.badgeLabel}</span>
            <b>{profile.badgeText}</b>
          </div>
        )}
      </div>
    </div></section>
  );
}
