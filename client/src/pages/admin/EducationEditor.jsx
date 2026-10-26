import { useSection, Page, Field, Text, Area, ListEditor } from './ui.jsx';

export default function EducationEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} s={s}>
      <ListEditor items={d.items} onChange={(v) => s.set('items', v)} addLabel="Add education"
        summary={(e) => `${e.degree} · ${e.school}`} blank={() => ({ degree: '', school: '', details: '' })}
        row={(e, update) => (
          <>
            <div className="adm-grid two">
              <Field label="Degree"><Text value={e.degree} onChange={(v) => update({ ...e, degree: v })} /></Field>
              <Field label="School"><Text value={e.school} onChange={(v) => update({ ...e, school: v })} /></Field>
            </div>
            <Field label="Details"><Area value={e.details} onChange={(v) => update({ ...e, details: v })} /></Field>
          </>
        )} />
    </Page>
  );
}
