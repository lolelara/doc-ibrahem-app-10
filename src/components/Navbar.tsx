import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar" style={{
      background: 'var(--background-card)',
      boxShadow: 'var(--shadow-md)',
      padding: 'var(--spacing-md)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="navbar-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" className="logo" style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'bold',
          color: 'var(--primary-color)',
          textDecoration: 'none'
        }}>
          منصة التدريب الرياضي
        </Link>

        {/* قائمة التنقل للموبايل */}
        <button
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-sm)'
          }}
        >
          <i className="fas fa-bars" style={{ fontSize: 'var(--font-size-xl)' }}></i>
        </button>

        {/* قائمة التنقل */}
        <div className={`nav-links ${isMenuOpen ? 'show' : ''}`} style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'center'
        }}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            style={{
              color: isActive('/') ? 'var(--primary-color)' : 'var(--text-primary)',
              fontWeight: isActive('/') ? 'bold' : 'normal'
            }}
          >
            الرئيسية
          </Link>
          <Link
            to="/training-plans"
            className={`nav-link ${isActive('/training-plans') ? 'active' : ''}`}
            style={{
              color: isActive('/training-plans') ? 'var(--primary-color)' : 'var(--text-primary)',
              fontWeight: isActive('/training-plans') ? 'bold' : 'normal'
            }}
          >
            خطط التدريب
          </Link>
          <Link
            to="/videos"
            className={`nav-link ${isActive('/videos') ? 'active' : ''}`}
            style={{
              color: isActive('/videos') ? 'var(--primary-color)' : 'var(--text-primary)',
              fontWeight: isActive('/videos') ? 'bold' : 'normal'
            }}
          >
            الفيديوهات
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            style={{
              color: isActive('/profile') ? 'var(--primary-color)' : 'var(--text-primary)',
              fontWeight: isActive('/profile') ? 'bold' : 'normal'
            }}
          >
            الملف الشخصي
          </Link>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              marginRight: 'var(--spacing-md)'
            }}
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>

      {/* الأنماط الخاصة بالشاشات الصغيرة */}
      <style>
        {`
          @media (max-width: 768px) {
            .menu-button {
              display: block;
            }
            .nav-links {
              display: none;
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: var(--background-card);
              flex-direction: column;
              padding: var(--spacing-md);
              box-shadow: var(--shadow-md);
            }
            .nav-links.show {
              display: flex;
              animation: menuSlide var(--transition-normal) ease;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar; 