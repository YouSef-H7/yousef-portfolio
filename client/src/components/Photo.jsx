import { useState } from 'react';

// Image slot that keeps its aspect ratio and shows a patterned fallback when there is no photo yet.
export default function Photo({ src, alt, width, height, priority = false, fallback = null, className = '' }) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  return (
    <div className={`slot ${show ? '' : 'missing'} ${className}`}>
      {show && (
        <img src={src} alt={alt} width={width} height={height} decoding="async"
          loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)} />
      )}
      {!show && <div className="empty" aria-hidden="true">{fallback}</div>}
    </div>
  );
}
