import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCreditCard, faBars, faLocationArrow, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
    <div>
      <div className="sidebar">
        <div className="menu-items">
          <div className="menu-item">
            <FontAwesomeIcon icon={faHome} />
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faBars} />
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faLocationArrow} />
          </div>
          <div className="menu-item">
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 40px;
          height: 100%;
          background: white;
        }

        .menu-items {
          padding: 10px 0;
        }

        .menu-item {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          font-size: 14px;
          margin: 5px auto;
          border-radius: 5px;
        }

        .menu-item:hover {
          background: #37C1BE;
          color: white;
        }

        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Header;