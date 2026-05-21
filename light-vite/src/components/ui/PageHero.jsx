export default function PageHero({ title, subtitle, minimal = false }) {
  return (
    <header className={`page-hero ${minimal ? 'minimal' : ''}`}>
      <div className="page-hero-content container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  );
}
