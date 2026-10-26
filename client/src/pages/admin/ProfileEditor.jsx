import { useSection, Page, Field, Text, Area, Toggle } from './ui.jsx';
import { Rich } from '../../rich.jsx';

export default function ProfileEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="The first screen a visitor sees." s={s}>
      <div className="adm-grid two">
        <Field label="First name"><Text value={d.firstName} onChange={(v) => s.set('firstName', v)} /></Field>
        <Field label="Last name" hint="Shown outlined, under the first name"><Text value={d.lastName} onChange={(v) => s.set('lastName', v)} /></Field>
      </div>
      <Field label="Eyebrow line" hint="Small label above the name"><Text value={d.eyebrow} onChange={(v) => s.set('eyebrow', v)} /></Field>
      <Field label="Intro paragraph" hint="Wrap words in **double stars** to highlight them">
        <Area rows={4} value={d.lede} onChange={(v) => s.set('lede', v)} />
      </Field>
      <div className="adm-preview"><span className="adm-label">Preview</span><p className="lede"><Rich text={d.lede} /></p></div>
      <div className="adm-grid two">
        <Field label="Primary button"><Text value={d.primaryCta} onChange={(v) => s.set('primaryCta', v)} /></Field>
        <Field label="Secondary button"><Text value={d.secondaryCta} onChange={(v) => s.set('secondaryCta', v)} /></Field>
      </div>
      <fieldset className="adm-fieldset">
        <legend>Badge on the portrait</legend>
        <div className="adm-grid two">
          <Field label="Label"><Text value={d.badgeLabel} onChange={(v) => s.set('badgeLabel', v)} /></Field>
          <Field label="Text" hint="Leave empty to hide the badge"><Text value={d.badgeText} onChange={(v) => s.set('badgeText', v)} /></Field>
        </div>
        <Toggle checked={d.badgeLive} onChange={(v) => s.set('badgeLive', v)} label="Show the green 'live' dot" />
      </fieldset>
    </Page>
  );
}
