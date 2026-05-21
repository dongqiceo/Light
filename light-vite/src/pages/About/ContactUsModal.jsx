import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useContactForm } from '../../hooks/useContactForm';
import '../../styles/pages/contact-modal.css';

const FIELD_KEYS = [
  { name: 'name', required: true },
  { name: 'email', required: true },
  { name: 'country', required: false },
  { name: 'tel', required: false },
  { name: 'whatsapp', required: false },
  { name: 'company', required: false },
];

function FieldInput({ id, label, required, value, error, onChange, multiline }) {
  const InputTag = multiline ? 'textarea' : 'input';
  return (
    <div className={`cu-modal__field${multiline ? ' cu-modal__field--full' : ''}`}>
      <label className="cu-modal__label" htmlFor={id}>
        {label}
        {required ? <span className="cu-modal__required">*</span> : null}
      </label>
      <InputTag
        id={id}
        className={multiline ? 'cu-modal__textarea' : 'cu-modal__input'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...(multiline ? {} : { type: id === 'email' ? 'email' : 'text' })}
      />
      {error ? <p className="cu-modal__error">{error}</p> : null}
    </div>
  );
}

export default function ContactUsModal({ open, onClose, onSuccess, onError }) {
  const { t } = useTranslation();

  const handleSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const handleError = useCallback(
    (kind, detail) => {
      onError?.(kind, detail);
    },
    [onError],
  );

  const { fields, errors, isSubmitting, setField, submit, reset } = useContactForm({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const label = (key) => t(`about.contactForm.fields.${key}`);

  return createPortal(
    <div
      className="cu-modal__backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="cu-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cu-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cu-modal__header">
          <h2 id="cu-modal-title" className="cu-modal__title">
            {t('about.contactForm.modalTitle')}
          </h2>
          <button type="button" className="cu-modal__close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="cu-modal__banner">{t('about.contactForm.banner')}</div>

        <form
          className="cu-modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <div className="cu-modal__grid">
            {FIELD_KEYS.map(({ name, required }) => (
              <FieldInput
                key={name}
                id={`contact-${name}`}
                label={label(name)}
                required={required}
                value={fields[name]}
                error={errors[name]}
                onChange={(v) => setField(name, v)}
              />
            ))}
            <FieldInput
              id="contact-message"
              label={label('message')}
              required
              value={fields.message}
              error={errors.message}
              onChange={(v) => setField('message', v)}
              multiline
            />
          </div>

          <div className="cu-modal__actions">
            <button type="submit" className="cu-modal__submit" disabled={isSubmitting}>
              {isSubmitting ? t('about.contactForm.submitting') : t('about.contactForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
