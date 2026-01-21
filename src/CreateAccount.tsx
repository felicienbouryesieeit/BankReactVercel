import React, { useState, type CSSProperties, useEffect } from 'react';
const ACCENT_COLOR = 'rgba(0, 150, 136, 1)'; 
const LIGHT_TURQUOISE_TRANSPARENT = 'rgba(0, 128, 128, 0.05)'; 
const pageContainerStyle: CSSProperties = {
  
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center',    
  minHeight: '100vh',      
  width: '100%',           
  
  
  backgroundImage: `linear-gradient(to bottom right, #ffffff, ${LIGHT_TURQUOISE_TRANSPARENT})`,
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

function CreateAccount() {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Compte courant'); 
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false); 
  const [isCreateHovered, setIsCreateHovered] = useState(false); 

  const accountTypeOptions = ['Compte courant', 'Compte épargne', 'Compte joint'];

  
  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyBg = document.body.style.backgroundColor;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = 'white'; 

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  const handleCreate = () => {
    if (isCreating) return;
    if (!accountName.trim()) {
      alert("Veuillez donner un nom au compte.");
      return;
    }
    console.log(`Création du compte "${accountName}" de type "${accountType}" en cours...`);
    setIsCreating(true);

    setTimeout(() => {
      alert(`Le compte "${accountName}" a été créé avec succès !`);
      setIsCreating(false);
      setAccountName('');
    }, 1500);
  };

  const handleCancel = () => {
    alert("Opération annulée.");
    setAccountName('');
    setAccountType('Compte courant');
  };

  return (
    <div style={pageContainerStyle}>
      <div style={styles.container}>
        
        <h2 style={styles.title}>
          <strong style={{ fontWeight: 'bold' }}>Ajouter un compte</strong>
        </h2>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Type de compte</label>
          <div style={styles.selectContainer}>
            <select
              style={styles.selectInput}
              value={accountType} 
              onChange={(e) => setAccountType(e.target.value)} 
            >
              {accountTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span style={styles.selectArrow}>&#9660;</span> 
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nom du compte</label>
          <input
            type="text"
            placeholder="Nom du compte"
            style={styles.input}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.button,
              ...styles.cancelButton,
              ...(isCancelHovered ? styles.cancelButtonHover : {}),
            }}
            onClick={handleCancel} 
            disabled={isCreating} 
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
          >
            Annuler
          </button>
          
          <button
            style={{
              ...styles.button,
              ...styles.createButton,
              ...(isCreating ? styles.disabledButton : {}),
              ...(isCreateHovered && !isCreating ? styles.createButtonHover : {}), 
            }}
            onClick={handleCreate} 
            disabled={isCreating || !accountName.trim()} 
            onMouseEnter={() => setIsCreateHovered(true)}
            onMouseLeave={() => setIsCreateHovered(false)}
          >
            {isCreating ? 'Création en cours...' : 'Créer un compte'} 
          </button>
        </div>

        {isCreating && <p style={styles.loadingMessage}>Traitement de la demande...</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '400px',
    width: '90%', 
    padding: '40px', 
    border: 'none', 
    borderRadius: '16px', 
    textAlign: 'left', 
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)', 
    backgroundColor: '#fff', 
  },
  title: {
    color: '#020202', 
    marginBottom: '30px', 
    fontSize: '2.5rem', 
    fontWeight: 'normal', 
  },
  formGroup: {
    textAlign: 'left',
    marginBottom: '20px', 
  },
  label: {
    display: 'block',
    marginBottom: '8px', 
    fontSize: '1em',
    fontWeight: 'normal', 
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px 15px', 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    boxSizing: 'border-box',
    fontSize: '1em',
    backgroundColor: 'white',
  },
  selectContainer: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
  },
  selectInput: {
    appearance: 'none', 
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    width: '100%',
    padding: '12px 15px', 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    boxSizing: 'border-box',
    fontSize: '1em',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#333', 
  },

  selectArrow: {
    position: 'absolute',
    right: '15px', 
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none', 
    color: '#333', 
    fontSize: '0.9em', 
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px', 
    marginTop: '40px', 
  },
  button: {
    padding: '14px 25px', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '1.1em', 
    flexGrow: 1, 
    transition: 'background-color 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    fontWeight: 'bold', 
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#333', 
    border: `1px solid ${ACCENT_COLOR}`, 
  },
  cancelButtonHover: {
    backgroundColor: '#f0f0f0', 
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  createButton: {
    border: 'none', 
    backgroundColor: ACCENT_COLOR, 
    color: 'white', 
  },
  createButtonHover: {
    backgroundColor: 'rgba(0, 150, 136, 0.85)', 
    boxShadow: '0 4px 8px rgba(0, 150, 136, 0.3)', 
  },
  disabledButton: {
      backgroundColor: 'rgba(0, 150, 136, 0.5)', 
      color: 'white', 
      border: 'none',
      cursor: 'not-allowed',
      boxShadow: 'none',
      opacity: 0.9,
  },
  loadingMessage: {
    marginTop: '20px',
    color: ACCENT_COLOR,
    fontStyle: 'italic',
    textAlign: 'center',
  }
};

export default CreateAccount;