import { useRef, useState } from 'react';
import { api } from '../../api.js';
import { useContent } from '../../content.jsx';

const SLOTS = [
  { key: 'portrait', label: 'Portrait', hint: 'Hero. Vertical 4:5, also used as the link preview image.', ratio: 'r45' },
  { key: 'work', label: 'At work', hint: 'About section, wide 16:9.', ratio: 'r169' },
  { key: 'detail', label: 'Second photo', hint: 'About section, vertical 4:5.', ratio: 'r45' },
];

function Slot({ slot, url, onChange }) {
  const input = useRef();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange((await api.uploadPhoto(slot.key, file)).photos);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  const remove = async () => {
    if (!confirm('Remove this photo?')) return;
    setBusy(true);
    try {
      onChange((await api.removePhoto(slot.key)).photos);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-photo">
      <div className={`adm-photo-frame ${slot.ratio} ${busy ? 'busy' : ''}`}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}>
        {url ? <img src={url} alt={slot.label} /> : <span className="adm-muted">No photo. Drop one here.</span>}
        {busy && <span className="adm-photo-busy">Uploading…</span>}
      </div>
      <h3>{slot.label}</h3>
      <p className="adm-muted">{slot.hint}</p>
      <div className="adm-row">
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
        <button type="button" className="btn warm" disabled={busy} onClick={() => input.current.click()}>{url ? 'Replace' : 'Upload'}</button>
        {url && <button type="button" className="btn ghost" disabled={busy} onClick={remove}>Remove</button>}
      </div>
      {error && <div className="adm-error" role="alert">{error}</div>}
    </div>
  );
}

export default function PhotosEditor({ title }) {
  const { content, patch } = useContent();
  const photos = content.photos || {};
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>{title}</h1>
        <p className="adm-muted">Photos go live immediately. They are resized and converted to WebP on the server, so phone photos are fine. Max 15 MB.</p>
      </header>
      <div className="adm-grid three">
        {SLOTS.map((slot) => <Slot key={slot.key} slot={slot} url={photos[slot.key]} onChange={(p) => patch('photos', p)} />)}
      </div>
    </div>
  );
}
