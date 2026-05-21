import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ContactUsModal from '../../pages/About/ContactUsModal';
import ContactToast from '../ui/ContactToast';

function IconContact() {
  return (
    <svg t="1779262288040" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5116" width="28" height="28"><path d="M512 113.777664c251.35104 0 455.110656 178.290688 455.110656 398.222336 0 219.931648-203.759616 398.222336-455.110656 398.222336-92.73344 0-178.988032-24.2688-250.923008-65.942528l-145.903616 47.11936a28.444672 28.444672 0 0 1-19.526656-0.74752c-14.53568-5.955584-21.491712-22.56896-15.536128-37.10464l50.74432-123.845632C84.082688 667.132928 56.889344 592.345088 56.889344 512c0-219.931648 203.759616-398.222336 455.110656-398.222336z m0 341.332992c-31.418368 0-56.889344 25.470976-56.889344 56.889344s25.470976 56.889344 56.889344 56.889344 56.889344-25.470976 56.889344-56.889344-25.470976-56.889344-56.889344-56.889344z m-227.555328 0c-31.419392 0-56.889344 25.470976-56.889344 56.889344s25.469952 56.889344 56.889344 56.889344c31.418368 0 56.88832-25.470976 56.88832-56.889344s-25.469952-56.889344-56.88832-56.889344z m455.110656 0c-31.418368 0-56.88832 25.470976-56.88832 56.889344s25.469952 56.889344 56.88832 56.889344c31.419392 0 56.889344-25.470976 56.889344-56.889344s-25.469952-56.889344-56.889344-56.889344z" fill="#ffffff" p-id="5117"></path></svg>
  );
}

export default function FloatingContactFab() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const handleSubmitSuccess = useCallback(() => {
    setModalOpen(false);
    setToast({
      show: true,
      type: 'success',
      message: t('about.contactForm.toast.success'),
    });
  }, [t]);

  const handleSubmitError = useCallback(
    (kind) => {
      const message =
        kind === 'network'
          ? t('about.contactForm.toast.errorNetwork')
          : t('about.contactForm.toast.errorSubmit');
      setToast({ show: true, type: 'error', message });
    },
    [t],
  );

  return (
    <>
      <button
        type="button"
        className="floating-contact-fab"
        onClick={() => setModalOpen(true)}
        aria-label={t('about.contactForm.openButton')}
        title={t('about.contactForm.openButton')}
      >
        <IconContact width={24} height={24} />
      </button>

      <ContactUsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSubmitSuccess}
        onError={handleSubmitError}
      />

      <ContactToast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={dismissToast}
      />
    </>
  );
}
