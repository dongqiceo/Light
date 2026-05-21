import { useAboutContact } from '../../hooks/useAboutContact';

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 .9c.05 1.25.25 2.46.62 3.59a1 1 0 0 1-.25 1.01l-2.25 2.29z"
      />
    </svg>
  );
}

const CONTACT_ROWS = [
  { key: 'address', Icon: IconLocation, href: null },
  { key: 'email', Icon: IconMail, href: (v) => `mailto:${v}` },
  { key: 'phone', Icon: IconPhone, href: (v) => `tel:${v.replace(/[^\d+]/g, '')}` },
];

export default function AboutContact() {
  const { contact } = useAboutContact();

  return (
    <section className="about-contact about-card">
      <div className="about-contact-brand">
        <div className="about-contact-brand-text">
          <p className="about-contact-tagline">{contact.tagline}</p>
          <p className="about-contact-desc">{contact.intro}</p>
        </div>
        <img
          src="/logo.png"
          alt="YEELEN Lighting"
          className="about-contact-logo"
          width={300}
          height={100}
        />
      </div>

      <ul className="about-contact-list">
        {CONTACT_ROWS.map(({ key, Icon, href }) => {
          const value = contact[key];
          const label = contact[`${key}Label`];
          const content = href ? (
            <a href={href(value)} className="about-contact-value">
              {value}
            </a>
          ) : (
            <span className="about-contact-value">{value}</span>
          );

          return (
            <li key={key} className="about-contact-item">
              <span className="about-contact-icon">
                <Icon />
              </span>
              <div className="about-contact-body">
                <strong>{label}</strong>
                {content}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
