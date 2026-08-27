const SOCIAL_LINKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
];

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function SocialLinks({ social }) {
  const links = SOCIAL_LINKS
    .map(({ key, label }) => ({ key, label, href: safeUrl(social?.[key]) }))
    .filter((item) => item.href);

  if (!links.length) return null;

  return (
    <nav className="social-links" aria-label="Social media">
      {links.map(({ key, label, href }) => (
        <a key={key} href={href} className={`social-link social-link-${key}`} target="_blank" rel="noreferrer">
          {label}
        </a>
      ))}
    </nav>
  );
}