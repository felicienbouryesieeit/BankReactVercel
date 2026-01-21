import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function ProfilePage() {
    const navigate = useNavigate();
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [emailField, setEmailField] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [emailSuccess, setEmailSuccess] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);

    const handlePasswordChange = (name: string, value: string) => {
        setPasswordFields(prevFields => ({ ...prevFields, [name]: value }));
        setPasswordError('');
    };

    const handleEmailChange = (value: string) => {
        setEmailField(value);
        setEmailError('');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/connexion');
    };

    // Fonction de validation du mot de passe
    const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Le mot de passe doit contenir au moins 8 caractères');
        }

        if (!/\d/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins 1 chiffre');
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Le mot de passe doit contenir au moins 1 caractère spécial');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const handlePasswordSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation de base
        if (passwordFields.newPassword !== passwordFields.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }

        // Validation renforcée du mot de passe
        const passwordValidation = validatePassword(passwordFields.newPassword);
        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.errors.join(', '));
            return;
        }

        setLoadingPassword(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/users/me/password/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordFields.currentPassword,
                    new_password: passwordFields.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de la modification du mot de passe');
            }

            setPasswordSuccess('Mot de passe modifié avec succès ! Déconnexion automatique...');
            
            // Déconnexion automatique après 2 secondes
            setTimeout(() => {
                handleLogout();
            }, 2000);
            
        } catch (err: any) {
            setPasswordError(err.message || 'Une erreur est survenue');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleEmailSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');

        if (!emailField.trim()) {
            setEmailError('L\'email est requis');
            return;
        }

        setLoadingEmail(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/users/me/email/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_email: emailField
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de la modification de l\'email');
            }

            setEmailSuccess('Email modifié avec succès ! Déconnexion automatique...');
            
            // Déconnexion automatique après 2 secondes
            setTimeout(() => {
                handleLogout();
            }, 2000);
            
        } catch (err: any) {
            setEmailError(err.message || 'Une erreur est survenue');
        } finally {
            setLoadingEmail(false);
        }
    };

    return (
        <Layout>
            <div className="profile-page-wrapper">
                <div className="profile-form">
                    {/* En-tête avec titre et bouton déconnexion alignés */}
                    <div className="profile-header">
                        <h1>Profil</h1>
                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Déconnexion
                        </button>
                    </div>

                    <div className="forms-layout">
                        {/* Formulaire changement de mot de passe */}
                        <div className="form-card">
                            <h3>Changer de mot de passe</h3>

                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}
                            {passwordSuccess && (
                                <div className="success-message">{passwordSuccess}</div>
                            )}

                            <div className="password-requirements">
                                <p className="requirements-title">Le mot de passe doit contenir :</p>
                                <ul className="requirements-list">
                                    <li className={passwordFields.newPassword.length >= 8 ? 'valid' : ''}>
                                        Au moins 8 caractères
                                    </li>
                                    <li className={/\d/.test(passwordFields.newPassword) ? 'valid' : ''}>
                                        Au moins 1 chiffre
                                    </li>
                                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordFields.newPassword) ? 'valid' : ''}>
                                        Au moins 1 caractère spécial
                                    </li>
                                </ul>
                            </div>

                            <div className="form-group">
                                <label>Mot de passe actuel</label>
                                <input
                                    type="password"
                                    value={passwordFields.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordFields.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmez le mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordFields.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                onClick={handlePasswordSubmit}
                                className="submit-button"
                                disabled={loadingPassword}
                            >
                                {loadingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                            </button>
                        </div>

                        {/* Formulaire changement d'email */}
                        <div className="form-card">
                            <h3>Changer d'email</h3>

                            {emailError && (
                                <div className="error-message">{emailError}</div>
                            )}
                            {emailSuccess && (
                                <div className="success-message">{emailSuccess}</div>
                            )}

                            <div className="form-group">
                                <label>Nouvel email</label>
                                <input
                                    type="email"
                                    value={emailField}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                onClick={handleEmailSubmit}
                                className="submit-button"
                                disabled={loadingEmail}
                            >
                                {loadingEmail ? 'Modification...' : 'Modifier l\'email'}
                            </button>
                        </div>
                    </div>
                </div>

                <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                .profile-page-wrapper {
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    padding: 40px;
                    min-height: 100vh;
                }

                .profile-form {
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                /* Nouvelle section pour l'en-tête */
                .profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-bottom: 30px;
                }

                .profile-header h1 {
                    font-size: 36px;
                    color: #333;
                    font-weight: 700;
                    margin: 0;
                }

                .forms-layout {
                    display: flex;
                    gap: 30px;
                    width: 100%;
                    flex-wrap: wrap;
                }

                .form-card {
                    flex: 1;
                    padding: 25px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: white;
                    min-width: 300px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .form-card h3 {
                    margin-top: 0;
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                    font-weight: 600;
                }

                /* Section des exigences de mot de passe */
                .password-requirements {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border-left: 4px solid #37C1BE;
                }

                .requirements-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .requirements-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .requirements-list li {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 4px;
                    padding-left: 16px;
                    position: relative;
                    transition: color 0.2s;
                }

                .requirements-list li:before {
                    content: '✗';
                    position: absolute;
                    left: 0;
                    color: #dc3545;
                }

                .requirements-list li.valid {
                    color: #28a745;
                }

                .requirements-list li.valid:before {
                    content: '✓';
                    color: #28a745;
                }

                .error-message {
                    padding: 10px;
                    background-color: #fee;
                    border: 1px solid #fcc;
                    border-radius: 4px;
                    color: #c33;
                    font-size: 13px;
                    margin-bottom: 15px;
                }

                .success-message {
                    padding: 10px;
                    background-color: #efe;
                    border: 1px solid #cfc;
                    border-radius: 4px;
                    color: #3c3;
                    font-size: 13px;
                    margin-bottom: 15px;
                }

                .form-group {
                    margin-bottom: 18px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: #f9f9f9;
                    color: #333;
                    box-sizing: border-box;
                    font-size: 14px;
                    transition: border-color 0.2s, background-color 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #37C1BE;
                    background-color: white;
                }

                .logout-button {
                    padding: 12px 24px;
                    background-color: #f44336;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .logout-button:hover {
                    background-color: #d32f2f;
                }

                .submit-button {
                    padding: 12px 25px;
                    background-color: #37C1BE;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 15px;
                    font-weight: 600;
                    margin-top: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .submit-button:hover:not(:disabled) {
                    background-color: #26918F;
                }

                .submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .forms-layout {
                        flex-direction: column;
                    }

                    .profile-page-wrapper {
                        padding: 20px;
                    }

                    .profile-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .profile-header h1 {
                        font-size: 30px;
                    }
                }
            `}</style>
            </div>
        </Layout>
    );
}

export default ProfilePage;