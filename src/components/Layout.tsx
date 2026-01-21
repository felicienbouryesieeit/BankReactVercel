import { useState } from 'react';
import logo from '../logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faHome, 
  faCreditCard, 
  faExchangeAlt, 
  faPaperPlane, 
  faUsers,
  faBars
} from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: faHome, label: 'Dashboard', path: '/dashboard' },
    { icon: faCreditCard, label: 'Mes Comptes', path: '/comptes' },
    { icon: faExchangeAlt, label: 'Transactions', path: '/transactions' },
    { icon: faPaperPlane, label: 'Virements', path: '/transfer' },
    { icon: faUsers, label: 'Bénéficiaires', path: '/beneficiaires' },
  ];

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setIsSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f4f4f4;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: white;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .title-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .burger-btn {
          background: none;
          border: none;
          font-size: 20px;
          padding: 8px;
          color: #333;
          cursor: pointer;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .burger-btn:hover {
          background: #f0f0f0;
        }

        .user-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }

        .user-btn:hover {
          background: #f0f0f0;
        }

        .logo {
          width: 35px;
          height: 35px;
        }

        .title-container h1 {
          font-size: 22px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          background: #f4f4f4;
          border-radius: 8px;
          padding: 8px 14px;
          gap: 10px;
          border: 1px solid #e0e0e0;
        }

        .search-input {
          border: none;
          outline: none;
          padding: 0;
          font-size: 14px;
          width: 200px;
          background: transparent;
          color: #333;
        }

        .search-input::placeholder {
          color: #999;
        }

        .search-icon {
          color: #666;
          font-size: 16px;
        }

        .user-icon {
          color: #333;
          font-size: 20px;
        }

        /* Sidebar Desktop */
        .sidebar-desktop {
          position: fixed;
          top: 60px;
          left: 0;
          width: 70px;
          height: calc(100vh - 60px);
          background: white;
          box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);
          z-index: 900;
          display: flex;
          flex-direction: column;
          padding: 15px 0;
        }

        .menu-item-desktop {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 20px;
          margin: 5px auto;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .menu-item-desktop:hover {
          background: #37C1BE;
          color: white;
        }

        /* Sidebar Mobile */
        .sidebar-mobile {
          position: fixed;
          top: 60px;
          left: -280px;
          width: 260px;
          height: calc(100vh - 60px);
          background: white;
          z-index: 950;
          transition: left 0.3s ease;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
          overflow-y: auto;
        }

        .sidebar-mobile.open {
          left: 0;
        }

        .menu-items-mobile {
          padding: 20px 0;
        }

        .menu-item-mobile {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 20px;
          margin: 3px 12px;
          border-radius: 8px;
          color: #333;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .menu-item-mobile:hover {
          background: #37C1BE;
          color: white;
        }

        .menu-icon-mobile {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        /* Overlay */
        .overlay {
          position: fixed;
          top: 60px;
          left: 0;
          width: 100%;
          height: calc(100vh - 60px);
          background: rgba(0, 0, 0, 0.4);
          z-index: 940;
          display: none;
        }

        .overlay.visible {
          display: block;
        }

        /* Main Content */
        .main-content {
          margin-top: 60px;
          margin-left: 70px;
          padding: 20px;
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none;
          }

          .main-content {
            margin-left: 0;
          }

          .search-container {
            width: 180px;
          }

          .search-input {
            width: 140px;
          }

          .title-container h1 {
            font-size: 18px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="burger-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="title-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>FINVO</h1>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Rechercher une transaction" 
              className="search-input" 
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <button 
            className="user-btn"
            onClick={() => window.location.href = '/profil'}
            aria-label="Profil utilisateur"
          >
            <FontAwesomeIcon icon={faUser} className="user-icon" />
          </button>
        </div>
      </header>

      {/* Sidebar Desktop (toujours visible sur grand écran) */}
      <div className="sidebar-desktop">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item-desktop"
            onClick={() => handleNavigation(item.path)}
            title={item.label}
          >
            <FontAwesomeIcon icon={item.icon} />
          </div>
        ))}
      </div>

      {/* Sidebar Mobile (slide-in) */}
      <div className={`sidebar-mobile ${isSidebarOpen ? 'open' : ''}`}>
        <div className="menu-items-mobile">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item-mobile"
              onClick={() => handleNavigation(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} className="menu-icon-mobile" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay pour fermer la sidebar mobile */}
      <div 
        className={`overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Contenu principal */}
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

export default Layout;