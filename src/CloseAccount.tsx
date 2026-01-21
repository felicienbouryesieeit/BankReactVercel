import React, { useState, type CSSProperties } from 'react';

const ACCENT_COLOR = '#008080'; 
const LIGHT_TURQUOISE_TRANSPARENT = 'rgba(0, 128, 128, 0.05)'; 

const GLOBAL_PAGE_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center',    
  minHeight: '100vh',      
  width: '100vw', 
  margin: 0, 
  padding: 0, 
  
  backgroundImage: `linear-gradient(to bottom right, #ffffff, ${LIGHT_TURQUOISE_TRANSPARENT})`,
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
};

function CloseAccount() {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    console.log("Clôture du compte en cours...");
    setIsClosing(true);

    setTimeout(() => {
      alert("Votre compte a été clôturé avec succès !");
      setIsClosing(false); 
    }, 1500); 
  };

  const handleCancel = () => {
    alert("Opération annulée.");
  };

  const CancelButtonStyles = { 
    ...styles.button, 
    ...styles.cancelButton 
  };
  
  const CloseButtonStyles = { 
    ...styles.button, 
    ...styles.closeButton, 
    ...(isClosing ? styles.disabledButton : {})
  };


  return (
    <div style={GLOBAL_PAGE_STYLE}> 
        <div style={styles.container}>
            
            <h2 style={styles.title}>
                <strong style={{ fontWeight: 'bold' }}>Clôturer un compte</strong>
            </h2>
            
            <p style={styles.description}>
                Vous êtes sur le point de clôturer votre compte. Le solde de votre compte sera transféré sur votre compte principal.
            </p>

            <div style={styles.buttonGroup}>
                <button
                    style={CancelButtonStyles} 
                    onClick={handleCancel} 
                    disabled={isClosing} 
                >
                    Annuler
                </button>
                
                <button
                    style={CloseButtonStyles}
                    onClick={handleClose} 
                    disabled={isClosing} 
                >
                    {isClosing ? 'Clôture en cours...' : 'Clôturer'} 
                </button>
            </div>

            {isClosing && <p style={styles.loadingMessage}>Traitement de la demande...</p>}
        </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '400px',
    padding: '30px', 
    border: '1px solid #eee', 
    borderRadius: '12px', 
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)', 
    backgroundColor: '#fff', 
  },
  title: {
    color: '#333',
    marginBottom: '10px',
    fontSize: '1.8rem',
    fontWeight: 300,
  },
  description: {
    color: '#666',
    fontSize: '1em',
    lineHeight: 1.5,
    marginBottom: '30px',
    fontWeight: 'normal',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    flexGrow: 1, 
    transition: 'all 0.3s', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#333',
    border: `1px solid ${ACCENT_COLOR}`,
  },
  closeButton: {
    border: 'none',
    backgroundColor: ACCENT_COLOR,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
      boxShadow: 'none',
      opacity: 0.7,
  },
  loadingMessage: {
    marginTop: '20px',
    color: ACCENT_COLOR,
    fontStyle: 'italic',
    fontWeight: 'bold',
  }
};

export default CloseAccount;