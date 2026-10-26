import { useSection, Page, Field, Text, ListEditor } from './ui.jsx';

export default function CertificationsEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} s={s}>
      <Field label="Section heading"><Text value={d.heading} onChange={(v) => s.set('heading', v)} /></Field>
      <ListEditor items={d.items} onChange={(v) => s.set('items', v)} addLabel="Add certification"
        summary={(c) => `${c.issuer} · ${c.name}`} blank={() => ({ issuer: '', name: '' })}
        row={(c, update) => (
          <div className="adm-grid two">
            <Field label="Issuer" hint="Shown large: AWS, Google, Oracle…"><Text value={c.issuer} onChange={(v) => update({ ...c, issuer: v })} /></Field>
            <Field label="Certification"><Text value={c.name} onChange={(v) => update({ ...c, name: v })} /></Field>
          </div>
        )} />
    </Page>
  );
}
