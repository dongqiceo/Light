import { useNavigate } from 'react-router-dom';

export default function Logo({ className = '', size = 'md', onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate('/');
  };

  return (
    <button
      type="button"
      className={`logo ${size} ${className}`}
      onClick={handleClick}
      aria-label="YEELEN Home"
    >
      <img src="/logo.png" alt="YEELEN Lighting" className="logo-img" width={150} height={50} />
    </button>
  );
}
