export default function Education({ education }) {
  const items = education.items || [];
  if (!items.length) return null;
  return (
    <section id="education"><div className="wrap edu">
      <div className="eyebrow">Education</div>
      <div className="edu-list">
        {items.map((e, i) => (
          <div key={i}>
            <h3>{e.degree}<br />{e.school}</h3>
            <p>{e.details}</p>
          </div>
        ))}
      </div>
    </div></section>
  );
}
