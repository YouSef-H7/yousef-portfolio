import { Rich } from '../rich.jsx';
import Photo from './Photo.jsx';

export default function About({ about, photos }) {
  const hasWork = !!photos?.work;
  const hasDetail = !!photos?.detail;
  return (
    <section className="about" id="about"><div className="wrap">
      <div className="eyebrow">About</div>
      <p className="statement"><Rich text={about.statement} /></p>
      {(hasWork || hasDetail) && (
        <div className={`wide ${hasWork && hasDetail ? '' : 'single'}`}>
          {hasWork && (
            <figure>
              <Photo src={photos.work} alt={about.workCaption || 'At work'} width={1600} height={900} />
              {about.workCaption && <figcaption className="caption">{about.workCaption}</figcaption>}
            </figure>
          )}
          {hasDetail && (
            <figure>
              <Photo src={photos.detail} alt={about.detailCaption || 'Photo'} width={1100} height={1375} className={hasWork ? 'tall' : ''} />
              {about.detailCaption && <figcaption className="caption">{about.detailCaption}</figcaption>}
            </figure>
          )}
        </div>
      )}
    </div></section>
  );
}
