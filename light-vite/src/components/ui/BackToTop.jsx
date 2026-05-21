import { useScrollPosition } from '../../hooks/useScrollPosition';

export default function BackToTop({ threshold = 300 }) {
  const visible = useScrollPosition(threshold);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
