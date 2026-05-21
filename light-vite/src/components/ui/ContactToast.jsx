import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/pages/contact-modal.css';

export default function ContactToast({ message, type = 'success', show, onClose }) {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show || !message) return null;

  return createPortal(
    <div className={`cu-toast cu-toast--${type}`} role="status" aria-live="polite">
      {message}
    </div>,
    document.body,
  );
}
