import React, { type CSSProperties } from 'react';

interface Account {
  id: number;
  name: string;
  balance: string;
  iban: string;
}

const userAccounts: Account[] = [
  { id: 1, name: 'Compte principal', balance: '1234,56€', iban: 'FR76 1234 4321 0987...' },
  { id: 2, name: 'Collocation', balance: '1234,56€', iban: 'FR76 1234 4321 0987...' },
  { id: 3, name: 'Abonnements', balance: '1234,56€', iban: 'FR76 1234 4321 0987...' },
  { id: 4, name: 'Courses', balance: '1234,56€', iban: 'FR76 1234 4321 0987...' },
];

const SidebarItem: React.FC<{ icon: string; isActive: boolean }> = ({ icon, isActive }) => (
    <div style={{ ...styles.sidebarItem, ...(isActive ? styles.sidebarItemActive : {}) }}>
        {icon}
    </div>
);

const AccountCard: React.FC<{ account: Account }> = ({ account }) => (
    <div style={styles.accountCard}>
        <h3 style={styles.accountName}>{account.name}</h3>
        <p style={styles.accountBalance}>{account.balance}</p>
        <p style={styles.accountIBAN}>{account.iban}</p>
        
        <div style={styles.cardButtonRow}>
            <button style={styles.cardButton}>
                <span style={styles.cardButtonIcon}>&#9776;</span>
                Transactions
            </button>
            <button style={styles.cardButton}>
                <span style={styles.cardButtonIcon}>&#9746;</span>
                Clôturer
            </button>
        </div>
    </div>
);

function AccountDashboard() {
  const totalAssets = '1234,56€';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.sidebar}>
          <SidebarItem icon="📝" isActive={false} />
          <SidebarItem icon="💰" isActive={true} /> 
          <SidebarItem icon="📊" isActive={false} />
          <SidebarItem icon="📅" isActive={false} />
          <SidebarItem icon="⚙️" isActive={false} />
      </div>
      
      <div style={styles.mainContentWrapper}>
        
       
        <div style={styles.header}>
            <div style={styles.headerTitles}>
                <h1 style={styles.mainTitle}>Mes comptes</h1>
                <p style={styles.subTitle}>Total des actifs: <strong style={styles.subTitleAsset}>{totalAssets}</strong></p>
            </div>
            
            <button style={styles.addButton}>
                Ajouter un compte 
                <span style={styles.addIcon}>+</span>
            </button>
        </div>
        
        <div style={styles.cardsGrid}>
          {userAccounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
        
      </div>
    </div>
  );
}

const ACCENT_COLOR = '#008080'; 
const LIGHT_TURQUOISE_TRANSPARENT = 'rgba(0, 128, 128, 0.05)';
const TEXT_COLOR = '#333'; 
const MAIN_TITLE_COLOR = '#005050'; 

const styles: { [key: string]: CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundImage: `linear-gradient(to bottom right, #ffffff, ${LIGHT_TURQUOISE_TRANSPARENT})`,
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    color: TEXT_COLOR,
  },
  sidebar: {
    width: '60px',
    backgroundColor: 'transparent', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px',
    boxShadow: '1px 0 5px rgba(0,0,0,0.05)',
  },
  sidebarItem: {
    fontSize: '1.5rem',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    opacity: 0.6,
    color: TEXT_COLOR,
    transition: 'opacity 0.2s, background-color 0.2s',
  },
  sidebarItemActive: {
    opacity: 1,
    backgroundColor: ACCENT_COLOR,
    color: 'white',
  },

  mainContentWrapper: {
    flexGrow: 1,
    padding: '40px 60px 40px 40px',
    margin: '0 auto', 
  },
  
    header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `1px solid rgba(0, 128, 128, 0.1)`, 
  },
  headerTitles: {},
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: MAIN_TITLE_COLOR,
  },
  subTitle: {
    fontSize: '1.1rem',
    margin: 0,
    color: TEXT_COLOR,
  },
  subTitleAsset: {
    fontWeight: 'bold',
    color: MAIN_TITLE_COLOR,
  },
  addButton: {
    backgroundColor: 'white',
    color: ACCENT_COLOR,
    border: `1px solid ${ACCENT_COLOR}`,
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s, color 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  addIcon: {
    fontSize: '1.2em',
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
    gap: '30px',
  },
    accountCard: {
    backgroundColor: 'white',
    color: '#333',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
  },
  accountCardHover: {
      transform: 'translateY(-3px)',
  },
  accountName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  accountBalance: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: ACCENT_COLOR,
  },
  accountIBAN: {
    fontSize: '0.9em',
    color: '#888',
    margin: '0 0 25px 0',
  },
  cardButtonRow: {
    display: 'flex',
    gap: '10px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    marginTop: 'auto',
  },
  cardButton: {
    backgroundColor: 'white',
    color: ACCENT_COLOR,
    border: `1px solid ${ACCENT_COLOR}`,
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'background-color 0.2s',
  },
  cardButtonIcon: {
      fontSize: '1.1em',
  }
};

export default AccountDashboard;