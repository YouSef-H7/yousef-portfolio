// Skills rendered as a Terraform module. Alignment is computed from the longest key.
export default function Stack({ stack }) {
  const scalars = stack.scalars || [];
  const groups = stack.groups || [];
  const pad = Math.max(...scalars.map((s) => s.key.length), 0);
  const gpad = Math.max(...groups.map((g) => g.key.length), 0);
  const Str = ({ v }) => <span className="s">"{v}"</span>;

  return (
    <section id="stack"><div className="wrap split">
      <div>
        <div className="eyebrow">Stack</div>
        <h2 className="sec-title">{stack.heading}</h2>
        <p className="stack-note">{stack.note}</p>
      </div>
      <div className="code">
        <div className="bar"><span>{stack.fileName}</span><span>{stack.barRight}</span></div>
        <pre tabIndex={0} aria-label="Skills written as a Terraform module">
          <span className="k">module</span> <Str v={stack.moduleName} /> <span className="p">{'{'}</span>{'\n'}
          {scalars.map((s) => (
            <span key={s.key}>{'  '}<span className="p">{s.key.padEnd(pad)}</span> = <Str v={s.value} />{'\n'}</span>
          ))}
          {scalars.length > 0 && groups.length > 0 && '\n'}
          {groups.map((g) => (
            <span key={g.key}>{'  '}<span className="p">{g.key.padEnd(gpad)}</span> = [
              {g.values.map((v, i) => <span key={v}>{i > 0 && ', '}<Str v={v} /></span>)}]{'\n'}</span>
          ))}
          {stack.comment && <>{'\n'}{'  '}<span className="c"># {stack.comment}</span>{'\n'}</>}
          <span className="p">{'}'}</span>
        </pre>
      </div>
    </div></section>
  );
}
