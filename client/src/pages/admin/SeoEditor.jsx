import { useSection, Page, Field, Text, Area } from './ui.jsx';

export default function SeoEditor({ section, title }) {
  const s = useSection(section);
  const d = s.draft;
  return (
    <Page title={title} intro="What Google, LinkedIn and WhatsApp show when the site is shared. The portrait photo is used as the preview image." s={s}>
      <Field label="Page title" hint={`${d.title.length}/60 characters${d.title.length > 60 ? ' · may be cut off in search results' : ''}`}><Text value={d.title} onChange={(v) => s.set('title', v)} /></Field>
      <Field label="Description" hint={`${d.description.length}/160 characters${d.description.length > 160 ? ' · may be cut off in search results' : ''}`}><Area value={d.description} onChange={(v) => s.set('description', v)} /></Field>
      <div className="adm-preview">
        <span className="adm-label">Search result preview</span>
        <div className="adm-serp">
          <span className="adm-serp-url">{location.origin}</span>
          <span className="adm-serp-title">{d.title || 'Untitled'}</span>
          <span className="adm-serp-desc">{d.description}</span>
        </div>
      </div>
    </Page>
  );
}
