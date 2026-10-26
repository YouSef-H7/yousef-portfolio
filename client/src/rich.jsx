// Tiny safe markup for editable text: **bold** → <strong>, *accent* → <em>, __link-color__ → <u>.
// Rendered as React elements, never as raw HTML.
const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g;

export function Rich({ text }) {
  if (!text) return null;
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('__') && part.endsWith('__')) return <u key={i}>{part.slice(2, -2)}</u>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
