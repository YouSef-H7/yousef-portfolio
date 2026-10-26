export default function Certifications({ certifications }) {
  const items = certifications.items || [];
  if (!items.length) return null;
  return (
    <section id="certs"><div className="wrap">
      <div className="eyebrow">Certifications</div>
      <h2 className="sec-title">{certifications.heading}</h2>
      <div className="certs">
        {items.map((c, i) => (
          <div className="cert" key={i}><span className="who">{c.issuer}</span><span className="what">{c.name}</span></div>
        ))}
      </div>
    </div></section>
  );
}
