import { useSection, Page, Field, Text, Area, TagList, ListEditor, slug } from './ui.jsx';

export default function ExperienceEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="Roles appear in this order. The first one is selected when the page opens." s={s}>
      <Field label="Section heading"><Text value={d.heading} onChange={(v) => s.set('heading', v)} /></Field>
      <ListEditor
        items={d.roles}
        onChange={(roles) => s.set('roles', roles)}
        addLabel="Add role"
        summary={(r) => `${r.year} · ${r.title || 'Untitled'} — ${r.org}`}
        blank={() => ({ id: slug(`role-${Date.now().toString(36)}`), year: String(new Date().getFullYear()), title: '', org: '', where: '', status: 'Running', points: [], tags: [] })}
        row={(r, update) => (
          <>
            <div className="adm-grid two">
              <Field label="Job title"><Text value={r.title} onChange={(v) => update({ ...r, title: v, id: r.id.startsWith('role-') && v ? slug(v) : r.id })} /></Field>
              <Field label="Organisation (short)"><Text value={r.org} onChange={(v) => update({ ...r, org: v })} /></Field>
              <Field label="Year shown in the list"><Text value={r.year} onChange={(v) => update({ ...r, year: v })} /></Field>
              <Field label="Status">
                <select value={r.status} onChange={(e) => update({ ...r, status: e.target.value })}>
                  <option>Running</option><option>Completed</option>
                </select>
              </Field>
            </div>
            <Field label="Where & when" hint="e.g. Company · City · 01/2026 – present"><Text value={r.where} onChange={(v) => update({ ...r, where: v })} /></Field>
            <Field label="Highlights" hint="One per line">
              <Area rows={5} value={r.points.join('\n')} onChange={(v) => update({ ...r, points: v.split('\n') })}
                onBlur={() => update({ ...r, points: r.points.map((p) => p.trim()).filter(Boolean) })} />
            </Field>
            <Field label="Tags"><TagList values={r.tags} onChange={(tags) => update({ ...r, tags })} /></Field>
          </>
        )}
      />
    </Page>
  );
}
