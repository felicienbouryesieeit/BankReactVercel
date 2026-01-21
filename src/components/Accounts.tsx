import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from './Layout';
import { Account, api, Transaction } from '../services/api';

// Composant Modal pour créer un compte
const CreateAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Compte courant');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => api.createAccount(accountName, accountType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setAccountName('');
      setAccountType('Compte courant');
      setError('');
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleCreate = () => {
    setError('');
    createMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>
          <strong>Ajouter un compte</strong>
        </h2>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Type de compte</label>
          <div style={styles.selectContainer}>
            <select
              style={styles.selectInput}
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="Compte courant">Compte courant</option>
              <option value="Compte épargne">Compte épargne</option>
              <option value="Compte joint">Compte joint</option>
            </select>
            <span style={styles.selectArrow}>▼</span>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nom du compte</label>
          <input
            type="text"
            placeholder="Nom du compte (optionnel)"
            style={styles.input}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Annuler
          </button>

          <button
            style={{ ...styles.button, ...styles.createButton }}
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Création en cours...' : 'Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour clôturer un compte avec mot de passe
const CloseAccountModal = ({
  isOpen,
  onClose,
  accountId,
  accountName,
}: {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  accountName: string;
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: (password: string) => api.closeAccount(accountId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setPassword('');
      setError('');
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }
    setError('');
    closeMutation.mutate(password);
  };

  const handleModalClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={handleModalClose}>
      <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>
          <strong>Clôturer un compte</strong>
        </h2>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <p style={styles.description}>
          Vous êtes sur le point de clôturer votre compte "{accountName}". Le solde sera transféré
          sur votre compte principal.
        </p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirmez avec votre mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !closeMutation.isPending) {
                handleClose();
              }
            }}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={handleModalClose}
            disabled={closeMutation.isPending}
          >
            Annuler
          </button>

          <button
            style={{
              ...styles.button,
              ...styles.closeButton,
              ...(closeMutation.isPending ? styles.disabledButton : {}),
            }}
            onClick={handleClose}
            disabled={closeMutation.isPending}
          >
            {closeMutation.isPending ? 'Clôture en cours...' : 'Clôturer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Ligne de transaction
const TransactionRow = ({ transaction, accountId }: { transaction: Transaction; accountId: number }) => {
  const isCredit = transaction.destination_account_id === accountId;
  const isDebit = transaction.source_account_id === accountId;
  
  const amount = transaction.amount;
  const displayAmount = isDebit && !isCredit ? `-${amount}` : `+${amount}`;
  const amountColor = isDebit && !isCredit ? '#bc965c' : '#5998a0';

  const getIcon = () => {
    if (transaction.transaction_type === 'transfer') return 'fa-exchange-alt';
    if (transaction.transaction_type === 'deposit') return 'fa-coins';
    if (transaction.transaction_type === 'bonus') return 'fa-gift';
    if (transaction.transaction_type === 'auto_transfer') return 'fa-bolt';
    return 'fa-file-alt';
  };

  const getIconBgColor = () => {
    if (transaction.transaction_type === 'transfer') return '#E0F2F7';
    return '#f0f4f8';
  };

  return (
    <div style={styles.transactionRow}>
      <div
        style={{
          ...styles.transactionIconContainer,
          backgroundColor: getIconBgColor(),
        }}
      >
        <i className={`fas ${getIcon()}`}></i>
      </div>

      <div style={styles.transactionDetails}>
        <div style={styles.transactionDescription}>
          <p style={styles.descriptionText}>
            {transaction.description || 'Transaction'}
          </p>
        </div>
        <p style={styles.accountText}>
          {new Date(transaction.created_at).toLocaleDateString('fr-FR')} • {transaction.transaction_type}
        </p>
      </div>
      <p style={{ ...styles.amountText, color: amountColor }}>
        {displayAmount} €
      </p>
    </div>
  );
};

// Composant Card de compte avec transactions
const AccountCard = ({ account }: { account: Account }) => {
  const [showTransactions, setShowTransactions] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const userId = parseInt(localStorage.getItem('user_id') || '0');

  // Récupérer toutes les transactions
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/show_all_user_transactions/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des transactions');
      return response.json();
    },
    enabled: userId > 0 && showTransactions,
  });

  // Filtrer les transactions pour ce compte
  const accountTransactions = allTransactions.filter((t: Transaction) => 
    t.source_account_id === account.id || t.destination_account_id === account.id
  );

  return (
    <>
      <div style={styles.accountCard}>
        <h3 style={styles.accountName}>
          {account.is_main ? 'Compte principal' : `Compte ${account.id}`}
        </h3>
        <p style={styles.accountBalance}>{account.balance.toFixed(2)}€</p>
        <p style={styles.accountIBAN}>{account.account_number}</p>

        <div style={styles.cardButtonRow}>
          <button
            style={styles.cardButton}
            onClick={() => setShowTransactions(!showTransactions)}
          >
            <i className={`fas ${showTransactions ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={styles.cardButtonIcon}></i>
            {showTransactions ? 'Masquer' : 'Transactions'}
          </button>

          {!account.is_main && (
            <button
              style={styles.cardButton}
              onClick={() => setShowCloseModal(true)}
            >
              <i className="fas fa-times" style={styles.cardButtonIcon}></i>
              Clôturer
            </button>
          )}
        </div>

        {showTransactions && (
          <div style={styles.transactionsSection}>
            <h4 style={styles.transactionsSectionTitle}>
              Transactions récentes ({accountTransactions.length})
            </h4>
            {accountTransactions.length === 0 ? (
              <p style={styles.noTransactions}>Aucune transaction</p>
            ) : (
              <div style={styles.transactionsList}>
                {accountTransactions.slice(0, 5).map((t: Transaction) => (
                  <TransactionRow key={t.id} transaction={t} accountId={account.id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CloseAccountModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        accountId={account.id}
        accountName={account.is_main ? 'Compte principal' : `Compte ${account.id}`}
      />
    </>
  );
};

// Composant principal
const AccountsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userId = parseInt(localStorage.getItem('user_id') || '0');

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', userId],
    queryFn: () => api.getUserAccounts(userId),
    enabled: userId > 0,
  });

  const totalAssets = accounts
    .filter((acc) => !acc.is_closed)
    .reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <Layout>
        <div style={styles.loading}>Chargement...</div>
      </Layout>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <Layout>
        <div style={styles.pageWrapper}>
          <div style={styles.mainContentWrapper}>
            <div style={styles.header}>
              <div style={styles.headerTitles}>
                <h1 style={styles.mainTitle}>Mes comptes</h1>
                <p style={styles.subTitle}>
                  Total des actifs: <strong style={styles.subTitleAsset}>{totalAssets.toFixed(2)}€</strong>
                </p>
              </div>

              <button
                style={styles.addButton}
                onClick={() => setShowCreateModal(true)}
              >
                Ajouter un compte
                <span style={styles.addIcon}>+</span>
              </button>
            </div>

            <div style={styles.cardsGrid}>
              {accounts
                .filter((acc) => !acc.is_closed)
                .map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
            </div>
          </div>
        </div>

        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </Layout>
    </>
  );
};

const ACCENT_COLOR = '#37C1BE';
const LIGHT_TURQUOISE_TRANSPARENT = 'rgba(55, 193, 190, 0.05)';
const TEXT_COLOR = '#333';
const MAIN_TITLE_COLOR = '#005050';

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundImage: `linear-gradient(to bottom right, #ffffff, ${LIGHT_TURQUOISE_TRANSPARENT})`,
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    color: TEXT_COLOR,
  },
  mainContentWrapper: {
    flexGrow: 1,
    padding: '40px 60px 40px 40px',
    margin: '0 auto',
    maxWidth: '1400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `1px solid rgba(55, 193, 190, 0.1)`,
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
  },
  transactionsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  transactionsSectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 15px 0',
    color: '#555',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#888',
    fontSize: '0.9em',
    padding: '20px 0',
  },
  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  transactionIconContainer: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12px',
    fontSize: '1em',
    color: '#555',
  },
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  transactionDescription: {
    fontSize: '0.95em',
    fontWeight: 'normal',
    color: '#333',
  },
  descriptionText: {
    margin: 0,
    fontWeight: '600',
  },
  accountText: {
    margin: '3px 0 0 0',
    fontSize: '0.75em',
    color: '#999',
    fontWeight: 'normal',
  },
  amountText: {
    fontSize: '1em',
    fontWeight: 'bold',
    margin: 0,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '1.2rem',
    color: ACCENT_COLOR,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    maxWidth: '400px',
    width: '90%',
    padding: '40px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  },
  modalContentSmall: {
    maxWidth: '400px',
    width: '90%',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    color: '#020202',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: 'normal',
  },
  description: {
    color: '#666',
    fontSize: '1em',
    lineHeight: 1.5,
    marginBottom: '30px',
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
  createButton: {
    border: 'none',
    backgroundColor: ACCENT_COLOR,
    color: 'white',
  },
  closeButton: {
    border: 'none',
    backgroundColor: '#FF6B6B',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    boxShadow: 'none',
    opacity: 0.7,
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '0.9em',
    textAlign: 'center',
  },
};

export default AccountsPage;