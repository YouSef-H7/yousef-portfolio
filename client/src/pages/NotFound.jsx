import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <div className="glow" aria-hidden="true" />
      <header className="top"><div className="wrap">
        <Link className="mark" to="/">Y<span>.</span>A</Link>
      </div></header>
      <main className="wrap lost">
        <div className="eyebrow">404 · resource not found</div>
        <h1>404<span>.</span></h1>
        <p>This page isn't in the state file. It may have been moved or never existed.</p>
        <div className="actions"><Link className="btn warm" to="/">Back to home</Link></div>
      </main>
    </>
  );
}
