import { useSection, Page, Field, Text, TagList, ListEditor } from './ui.jsx';
import Stack from '../../components/Stack.jsx';

const key = (v) => v.toLowerCase().replace(/[^a-z0-9_]+/g, '_');

export default function StackEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="Your skills, rendered as a Terraform module." s={s}>
      <div className="adm-grid two">
        <Field label="Section heading"><Text value={d.heading} onChange={(v) => s.set('heading', v)} /></Field>
        <Field label="Note under the heading"><Text value={d.note} onChange={(v) => s.set('note', v)} /></Field>
        <Field label="File name in the title bar"><Text value={d.fileName} onChange={(v) => s.set('fileName', v)} /></Field>
        <Field label="Right side of the title bar"><Text value={d.barRight} onChange={(v) => s.set('barRight', v)} /></Field>
        <Field label="Module name"><Text value={d.moduleName} onChange={(v) => s.set('moduleName', key(v))} /></Field>
        <Field label="Closing comment"><Text value={d.comment} onChange={(v) => s.set('comment', v)} /></Field>
      </div>

      <h2 className="adm-h2">Single values</h2>
      <ListEditor items={d.scalars} onChange={(v) => s.set('scalars', v)} addLabel="Add value"
        summary={(it) => `${it.key} = "${it.value}"`} blank={() => ({ key: 'key', value: '' })}
        row={(it, update) => (
          <div className="adm-grid two">
            <Field label="Key"><Text value={it.key} onChange={(v) => update({ ...it, key: key(v) })} /></Field>
            <Field label="Value"><Text value={it.value} onChange={(v) => update({ ...it, value: v })} /></Field>
          </div>
        )} />

      <h2 className="adm-h2">Lists</h2>
      <ListEditor items={d.groups} onChange={(v) => s.set('groups', v)} addLabel="Add list"
        summary={(g) => `${g.key} = [${g.values.length}]`} blank={() => ({ key: 'new_list', values: [] })}
        row={(g, update) => (
          <>
            <Field label="Key"><Text value={g.key} onChange={(v) => update({ ...g, key: key(v) })} /></Field>
            <Field label="Values"><TagList values={g.values} onChange={(values) => update({ ...g, values })} /></Field>
          </>
        )} />

      <div className="adm-preview dark"><span className="adm-label">Preview</span><Stack stack={d} /></div>
    </Page>
  );
}
