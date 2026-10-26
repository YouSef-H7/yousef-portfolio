import { useSection, Page, Field, Text, Area } from './ui.jsx';
import { Rich } from '../../rich.jsx';

export default function AboutEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="The large statement and the captions under the two photos." s={s}>
      <Field label="Statement" hint="*single stars* = warm accent, __double underscores__ = blue accent">
        <Area rows={4} value={d.statement} onChange={(v) => s.set('statement', v)} />
      </Field>
      <div className="adm-preview"><span className="adm-label">Preview</span><p className="statement"><Rich text={d.statement} /></p></div>
      <div className="adm-grid two">
        <Field label="Caption under the wide photo"><Text value={d.workCaption} onChange={(v) => s.set('workCaption', v)} /></Field>
        <Field label="Caption under the second photo"><Text value={d.detailCaption} onChange={(v) => s.set('detailCaption', v)} /></Field>
      </div>
      <p className="adm-muted">Upload the photos themselves under <b>Photos</b>.</p>
    </Page>
  );
}
