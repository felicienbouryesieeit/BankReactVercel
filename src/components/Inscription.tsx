import { useState } from 'react';
import gem from '../Gem.jpg';
import logo from '../logo.png';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction de validation du mot de passe
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (password.length < minLength) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (!hasNumber.test(password)) {
      return "Le mot de passe doit contenir au moins 1 chiffre";
    }
    
    if (!hasSpecialChar.test(password)) {
      return "Le mot de passe doit contenir au moins 1 caractère spécial (!@#$%^&*(), etc.)";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    
    // Validation des champs requis
    if (!firstName.trim() || !lastName.trim()) {
      setError("Le prénom et le nom sont requis");
      return;
    }

    // Validation de l'email
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }

    // Validation de la correspondance des mots de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    // Validation des critères du mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      const loginResponse = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('user_id', loginData.user.id.toString());
        window.location.href = '/transfer';
      }
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

        .register-form-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .register-form {
          width: 50%;
          height: 100vh;
          padding: 40px 40px 60px 40px;
          background-color: white;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: flex-start;
          overflow-y: auto;
          padding-top: 60px;
        }

        .image-container {
          width: 50%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .image-text-overlay {
          position: absolute;
          width: 43%;
          max-width: 350px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          text-align: left;
          color: #f4f4f4;
          z-index: 2;
        }

        .image-text-overlay h3 {
          font-size: 40px;
          width: 100%;
          margin-bottom: 20px;
          font-weight: bold;
          text-align: left;
          line-height: 1.1;
        }

        .image-text-overlay p {
          font-size: 15px;
          margin: 0;
          text-align: left;
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
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .logo {
          width: 50px;
          height: 50px;
        }

        .register-form h1 {
          margin: 0;
          color: #333;
          font-size: 35px;
        }

        .register-form h2 {
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

        .password-requirements {
          width: 80%;
          max-width: 350px;
          text-align: left;
          margin: 5px 0 15px 0;
          color: #666;
          font-size: 12px;
          line-height: 1.4;
        }

        .password-requirements ul {
          margin: 5px 0;
          padding-left: 20px;
        }

        .password-requirements li {
          margin-bottom: 3px;
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
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #26918F;
        }

        .login {
          width: 80%;
          max-width: 350px;
          text-align: left;
        }

        .login p {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .login-link {
          color: #37C1BE;
          margin-left: 5px;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="register-form-container">
        <div className="register-form">
          <div className="title-container">
            <img src={logo} alt="logo" className="logo" />
            <h1>FINVO</h1>
          </div>
          
          <h2>Créez votre compte !</h2>
          <p className="subtitle">Rejoignez des milliers d'utilisateurs</p>
          
          <div className="divider"></div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

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

          {/* Section des exigences du mot de passe */}
          <div className="password-requirements">
            <p><strong>Le mot de passe doit contenir :</strong></p>
            <ul>
              <li>Au moins 8 caractères</li>
              <li>Au moins 1 chiffre (0-9)</li>
              <li>Au moins 1 caractère spécial (!@#$%^&*(), etc.)</li>
            </ul>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="submit-button" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </div>

          <div className="divider"></div>

          <div className="login">
            <p>
              Vous avez déjà un compte ? <a href="/connexion" className="login-link">Connectez-vous</a>
            </p>
          </div>
        </div>

        <div className="image-container">
          <div className="image-text-overlay">
            <h3>La banque, simplifiée</h3>
            <p>Dashboard tout en un pour le paiement et suivre vos transactions</p>
          </div>
          <img src={gem} alt="Background image" className="background-image" />
        </div>
      </div>
    </>
  );
}

export default RegisterForm;