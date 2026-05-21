export const CONTACT_FIELD_ERRORS = {
  nameRequired: 'This field is required',
  emailRequired: 'This field is required',
  messageRequired: 'This field is required',
  emailInvalid: 'Please enter a valid email address',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMPTY_CONTACT_FIELDS = {
  name: '',
  email: '',
  message: '',
  country: '',
  tel: '',
  whatsapp: '',
  company: '',
};

export function validateContactForm(fields) {
  const errors = {};
  const name = (fields.name || '').trim();
  const email = (fields.email || '').trim();
  const message = (fields.message || '').trim();

  if (!name) errors.name = CONTACT_FIELD_ERRORS.nameRequired;
  if (!email) errors.email = CONTACT_FIELD_ERRORS.emailRequired;
  else if (!EMAIL_RE.test(email)) errors.email = CONTACT_FIELD_ERRORS.emailInvalid;
  if (!message) errors.message = CONTACT_FIELD_ERRORS.messageRequired;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildContactPayload(fields) {
  const trim = (v) => (v || '').trim();
  const opt = (v) => {
    const t = trim(v);
    return t === '' ? undefined : t;
  };
  return {
    name: trim(fields.name),
    email: trim(fields.email),
    message: trim(fields.message),
    country: opt(fields.country),
    tel: opt(fields.tel),
    whatsapp: opt(fields.whatsapp),
    company: opt(fields.company),
  };
}
