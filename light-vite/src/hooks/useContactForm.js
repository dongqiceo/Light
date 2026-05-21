import { useState, useCallback } from 'react';
import { submitContactForm } from '../services';
import {
  validateContactForm,
  buildContactPayload,
  EMPTY_CONTACT_FIELDS,
} from '../utils/contactValidation';

export function useContactForm({ onSuccess, onError }) {
  const [fields, setFields] = useState({ ...EMPTY_CONTACT_FIELDS });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setFields({ ...EMPTY_CONTACT_FIELDS });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const submit = useCallback(async () => {
    const { valid, errors: validationErrors } = validateContactForm(fields);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitContactForm(buildContactPayload(fields));
      if (res.code === 200) {
        reset();
        onSuccess?.();
      } else {
        onError?.('business', res.message);
      }
    } catch {
      onError?.('network');
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, isSubmitting, onSuccess, onError, reset]);

  return { fields, errors, isSubmitting, setField, submit, reset };
}
