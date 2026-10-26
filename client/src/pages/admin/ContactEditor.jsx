import { useSection, Page, Field, Text, ListEditor } from './ui.jsx';

export default function ContactEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="Everything here is public. Leave email or phone empty to hide it." s={s}>
      <div className="adm-grid two">
        <Field label="Headline"><Text value={d.headline} onChange={(v) => s.set('headline', v)} /></Field>
        <Field label="Headline accent" hint="Shown in the warm colour on its own line"><Text value={d.headlineAccent} onChange={(v) => s.set('headlineAccent', v)} /></Field>
        <Field label="Email"><Text type="email" value={d.email} onChange={(v) => s.set('email', v)} /></Field>
        <Field label="Phone"><Text value={d.phone} onChange={(v) => s.set('phone', v)} /></Field>
        <Field label="Location (footer)"><Text value={d.location} onChange={(v) => s.set('location', v)} /></Field>
      </div>
      <h2 className="adm-h2">Links</h2>
      <ListEditor items={d.links} onChange={(v) => s.set('links', v)} addLabel="Add link"
        summary={(l) => `${l.label} · ${l.url}`} blank={() => ({ label: 'LinkedIn', url: 'https://' })}
        row={(l, update) => (
          <div className="adm-grid two">
            <Field label="Label"><Text value={l.label} onChange={(v) => update({ ...l, label: v })} /></Field>
            <Field label="URL"><Text type="url" value={l.url} onChange={(v) => update({ ...l, url: v })} /></Field>
          </div>
        )} />
    </Page>
  );
}
