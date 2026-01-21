import { useState } from 'react';
import gem from '../Gem.jpg';
import logo from '../logo.png';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur de connexion');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_id', data.user.id.toString());
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .login-form-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .login-form {
          width: 50%;
          height: 100vh;
          padding: 40px;
          background-color: white;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          overflow-y: auto;
        }

        .image-container {
          width: 50%;
          height: 100vh;
          overflow: hidden;
        }

        .background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .title-container {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 80%;
          max-width: 350px;
          margin-bottom: 10px;
        }

        .logo {
          width: 50px;
          height: 50px;
        }

        .login-form h1 {
          margin: 0;
          color: #333;
          font-size: 35px;
        }

        .login-form h2 {
          width: 80%;
          max-width: 350px;
          text-align: left;
          margin: 20px 0 0 0;
          color: #333;
          font-size: 20px;
        }

        .subtitle {
          width: 80%;
          max-width: 350px;
          text-align: left;
          margin: 5px 0 0 0;
          color: #333;
          font-size: 13px;
        }

        .divider {
          height: 1px;
          background-color: #ddd;
          width: 80%;
          max-width: 350px;
          margin: 20px 0;
        }

        .error-message {
          width: 80%;
          max-width: 350px;
          padding: 10px;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
          width: 80%;
          max-width: 350px;
          text-align: left;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
          font-size: 13px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f4f4f4;
          color: #333;
          box-sizing: border-box;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 80%;
          max-width: 350px;
          margin-top: 10px;
          margin-bottom: 5px;
        }

        .submit-button {
          width: auto;
          padding: 10px 20px;
          background-color: #37C1BE;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 15px;
          font-weight: bold;
          margin-right: 20px;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #26918F;
        }

        .forgot-link {
          text-align: left;
          color: #777;
          font-size: 13px;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .register {
          width: 80%;
          max-width: 350px;
          text-align: left;
        }

        .register p {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .register-link {
          color: #37C1BE;
          margin-left: 5px;
          text-decoration: none;
        }

        .register-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-form-container">
        <div className="login-form">
          <div className="title-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>FINVO</h1>
          </div>
          
          <h2>Content de vous revoir !</h2>
          <p className="subtitle">Connectez vous à votre compte</p>
          
          <div className="divider"></div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="submit-button" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <a href="#" className="forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="divider"></div>

          <div className="register">
            <p>
              Pas encore de compte ? <a href="/inscription" className="register-link">Ouvrez un compte</a>
            </p>
          </div>
        </div>

        <div className="image-container">
          <img src={gem} alt="Background image" className="background-image" />
        </div>
      </div>
    </>
  );
}

export default LoginForm;