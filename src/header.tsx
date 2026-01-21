import { useState } from 'react';
import logo from './logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faHome, faCreditCard, faExchangeAlt, faPaperPlane, faUsers } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
          <div className="title-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>FINVO</h1>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <input type="text" placeholder="Rechercher une transaction" className="search-input" />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <button className="user-btn">
            <FontAwesomeIcon icon={faUser} className="user-icon" />
          </button>
          </div>
        </header>

      <div className={`sidebar ${isMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="menu-items">
          <div className="menu-item">
            <FontAwesomeIcon icon={faHome} className="menu-icon" />
            Dashboard
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faCreditCard} className="menu-icon" />
            Mes Comptes
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faExchangeAlt} className="menu-icon" />
            Transactions
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faPaperPlane} className="menu-icon" />
            Virements
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faUsers} className="menu-icon" />
            Bénéficiaires
          </div>
        </div>
      </div>

      {isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 20px;
          background: white;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .title-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .burger-btn {
          background: none;
          border: none;
          font-size: 18px;
          padding: 4px;
          color: black;
        }

        .burger-btn:hover {
          background: #f0f0f0;
          border-radius: 5px;
        }

        .user-btn {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 5px;
        }

        .user-btn:hover {
          background: #f0f0f0;
        }

        .logo {
          width: 30px;
          height: 30px;
        }

        .title-container h1 {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .search-container {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 5px;
          padding: 4px 12px;
          border: 1px solid #ddd;
          gap: 8px;
        }

        .search-input {
          border: none;
          outline: none;
          padding: 4px;
          font-size: 13px;
          width: 180px;
          background: white;
          color: #333;
        }

        .search-icon {
          color: #333;
          font-size: 14px;
        }

        .user-icon {
          color: #333;
          font-size: 18px;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 250px;
          height: 100%;
          background: white;
          z-index: 1000;
        }

        .sidebar-open {
          left: 0;
        }

        .menu-items {
          padding: 10px 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          margin: 2px 10px;
          border-radius: 5px;
          color: #333;
          font-size: 14px;
        }

        .menu-item:hover {
          background: #37C1BE;
        }

        .menu-icon {
          font-size: 16px;
          width: 20px;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        body {
          margin-top: 50px;
        }
      `}</style>
    </div>
  );
};

export default Header;