import { useEffect } from 'react';
import { useContent } from '../content.jsx';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';
import Stack from '../components/Stack.jsx';
import Certifications from '../components/Certifications.jsx';
import Education from '../components/Education.jsx';
import Contact from '../components/Contact.jsx';

export default function Portfolio() {
  const { content, error, refresh } = useContent();

  useEffect(() => {
    if (content?.seo?.title) document.title = content.seo.title;
  }, [content]);

  if (error && !content) {
    return (
      <main className="wrap lost">
        <div className="eyebrow">Connection problem</div>
        <h1>Hmm<span>.</span></h1>
        <p>The site content could not be loaded ({error}). Check your connection and try again.</p>
        <div className="actions"><button type="button" className="btn warm" onClick={refresh}>Try again</button></div>
      </main>
    );
  }
  if (!content) return <main className="wrap lost" aria-busy="true"><p className="eyebrow">Loading</p></main>;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="glow" aria-hidden="true" />
      <Header profile={content.profile} />
      <main id="main">
        <Hero profile={content.profile} photo={content.photos?.portrait} />
        <About about={content.about} photos={content.photos} />
        <Experience experience={content.experience} />
        <Stack stack={content.stack} />
        <Certifications certifications={content.certifications} />
        <Education education={content.education} />
        <Contact contact={content.contact} profile={content.profile} />
      </main>
    </>
  );
}
