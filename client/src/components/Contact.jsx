import { useState } from 'react';

function CopyButton({ value, label }) {
  const [state, setState] = useState('Copy');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('Copied');
    } catch {
      setState('Select text');
    }
    setTimeout(() => setState('Copy'), 1600);
  };
  return <button className="copy" type="button" onClick={copy} aria-label={label}>{state}</button>;
}

export default function Contact({ contact, profile }) {
  const year = new Date().getFullYear();
  return (
    <section className="contact" id="contact"><div className="wrap">
      <div className="eyebrow">Contact</div>
      <p className="big">{contact.headline}<br /><span>{contact.headlineAccent}</span></p>
      <div className="addr">
        {contact.email && (
          <div className="row"><span className="lab">Email</span>
            <a className="v" href={`mailto:${contact.email}`}>{contact.email}</a>
            <CopyButton value={contact.email} label="Copy email address" /></div>
        )}
        {contact.phone && (
          <div className="row"><span className="lab">Phone</span>
            <a className="v" href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a>
            <CopyButton value={contact.phone.replace(/[^\d+]/g, '')} label="Copy phone number" /></div>
        )}
        {(contact.links || []).map((l) => (
          <div className="row" key={l.url}><span className="lab">{l.label}</span>
            <a className="v" href={l.url} target="_blank" rel="noopener noreferrer">{l.url.replace(/^https?:\/\/(www\.)?/, '')}</a></div>
        ))}
      </div>
      <footer className="foot">
        <span>© {year} {profile.firstName} {profile.lastName}</span>
        <span>{contact.location}</span>
      </footer>
    </div></section>
  );
}
