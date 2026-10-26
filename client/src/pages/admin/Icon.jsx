// Small consistent icon set for the control panel (1.75px stroke, 24-unit grid).
const PATHS = {
  up: 'M12 19V5m0 0-6 6m6-6 6 6',
  down: 'M12 5v14m0 0 6-6m-6 6-6-6',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  external: 'M14 5h5v5M19 5l-9 9M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.1 6.1C3.6 7.9 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1',
  plus: 'M12 5v14M5 12h14',
};

export default function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
