import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from './Layout';
import { api, Transaction, Account } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Composant Header avec filtres
const TransactionsHeader = ({
  accounts,
  selectedAccount,
  onAccountChange,
  selectedMonth,
  onMonthChange,
  onDownload,
}: {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  onDownload: () => void;
}) => {
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);

  const months = [
    { label: 'Tous les mois', value: 'all' },
    { label: 'Novembre 2025', value: '2025-11' },
    { label: 'Octobre 2025', value: '2025-10' },
    { label: 'Septembre 2025', value: '2025-09' },
    { label: 'Août 2025', value: '2025-08' },
  ];

  return (
    <div style={styles.headerControlsWrapper}>
      <div style={styles.headerContentContainer}>
        <div style={styles.headerTitles}>
          <h1 style={styles.mainTitle}>Vos transactions</h1>
          <p style={styles.subTitle}>Gérer tout l'historique de vos transactions</p>
        </div>
        <div style={styles.headerControls}>
          <div style={styles.dropdownContainer}>
            <select
              style={styles.dropdownStyle}
              value={selectedAccount}
              onChange={(e) => onAccountChange(e.target.value)}
            >
              <option value="all">Tous mes comptes</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id.toString()}>
                  {acc.is_main ? 'Compte principal' : `Compte ${acc.id}`}
                </option>
              ))}
            </select>
            <span style={styles.dropdownArrow}>▼</span>
          </div>

          <div style={styles.dropdownContainer}>
            <select
              style={styles.dropdownStyle}
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <span style={styles.dropdownArrow}>▼</span>
          </div>

          <button
            style={{
              ...styles.downloadButton,
              ...(isDownloadHovered ? styles.downloadButtonHover : {}),
            }}
            onClick={onDownload}
            onMouseEnter={() => setIsDownloadHovered(true)}
            onMouseLeave={() => setIsDownloadHovered(false)}
          >
            Télécharger un relevé
            <i className="fas fa-download" style={styles.downloadIcon}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Onglets de navigation
const TransactionTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: 'transactions' | 'revenues' | 'expenses';
  onTabChange: (tab: 'transactions' | 'revenues' | 'expenses') => void;
}) => {
  const tabs = [
    { key: 'transactions' as const, label: 'Transactions' },
    { key: 'revenues' as const, label: 'Recettes' },
    { key: 'expenses' as const, label: 'Dépenses' },
  ];

  return (
    <div style={styles.topNavigation}>
      <div style={styles.navTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            style={
              tab.key === activeTab
                ? { ...styles.navTab, ...styles.navTabActive }
                : styles.navTab
            }
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Composant Ligne de transaction
const TransactionRow = ({ transaction, userAccountIds }: { transaction: Transaction; userAccountIds: number[] }) => {
  const isCredit = userAccountIds.includes(transaction.destination_account_id || 0);
  const isDebit = userAccountIds.includes(transaction.source_account_id || 0);
  
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
        <p style={styles.accountText}>{transaction.transaction_type}</p>
      </div>
      <p style={{ ...styles.amountText, color: amountColor }}>
        {displayAmount} €
      </p>
    </div>
  );
};

// Composant Header de date
const DateHeader = ({ date }: { date: string }) => (
  <div style={styles.dateHeaderContainer}>
    <p style={styles.dateHeaderText}>{date}</p>
  </div>
);

// Composant Pagination
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div style={styles.pagination}>
      <button
        style={styles.paginationButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </button>
      <div style={styles.paginationNumbers}>
        {pages.map((num) => (
          <button
            key={num}
            style={
              num === currentPage
                ? styles.currentPageButton
                : styles.pageNumberButton
            }
            onClick={() => onPageChange(num)}
          >
            {num.toString().padStart(2, '0')}
          </button>
        ))}
      </div>
      <button
        style={styles.paginationButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </button>
    </div>
  );
};

// Composant Sidebar de résumé
const SummarySidebar = ({
  totalEntries,
  totalExpenses,
  transactionCount,
}: {
  totalEntries: number;
  totalExpenses: number;
  transactionCount: number;
}) => {
  return (
    <div style={styles.summarySidebar}>
      <div style={styles.summaryCard}>
        <div style={styles.summaryCardHeader}>
          <span
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#E8F5E9',
              color: '#4CAF50',
            }}
          >
            <i className="fas fa-arrow-down"></i>
          </span>
          <p style={styles.summaryLabelCard}>Entrées</p>
        </div>
        <p style={styles.summaryValueCard}>{totalEntries.toFixed(2)}€</p>
      </div>

      <div style={styles.summaryCard}>
        <div style={styles.summaryCardHeader}>
          <span
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#FFECB3',
              color: '#FF9800',
            }}
          >
            <i className="fas fa-arrow-up"></i>
          </span>
          <p style={styles.summaryLabelCard}>Sorties</p>
        </div>
        <p style={styles.summaryValueCard}>{totalExpenses.toFixed(2)}€</p>
      </div>

      <div style={styles.summaryCard}>
        <div style={styles.summaryCardHeader}>
          <span
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#E0F2F7',
              color: '#03A9F4',
            }}
          >
            <i className="fas fa-clipboard-list"></i>
          </span>
          <p style={styles.summaryLabelCard}>Transactions</p>
        </div>
        <p style={styles.summaryValueCard}>{transactionCount}</p>
      </div>
    </div>
  );
};

// Composant principal
const TransactionsPage = () => {
  const userId = parseInt(localStorage.getItem('user_id') || '0');
  const [activeTab, setActiveTab] = useState<'transactions' | 'revenues' | 'expenses'>('transactions');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupérer les comptes
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', userId],
    queryFn: () => api.getUserAccounts(userId),
    enabled: userId > 0,
  });

  // Récupérer toutes les transactions
  const { data: allTransactions = [], isLoading } = useQuery({
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
    enabled: userId > 0,
  });

  // IDs des comptes de l'utilisateur
  const userAccountIds = accounts.map((acc) => acc.id);

  // Filtrer les transactions
  const filteredTransactions = allTransactions.filter((t: Transaction) => {
    // Filtre par compte
    if (selectedAccount !== 'all') {
      const accountId = parseInt(selectedAccount);
      if (
        t.source_account_id !== accountId &&
        t.destination_account_id !== accountId
      ) {
        return false;
      }
    }

    // Filtre par mois
    if (selectedMonth !== 'all') {
      const transactionDate = new Date(t.created_at);
      const transactionYearMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      if (transactionYearMonth !== selectedMonth) {
        return false;
      }
    }

    // Filtre par onglet
    if (activeTab === 'revenues') {
      return userAccountIds.includes(t.destination_account_id || 0);
    } else if (activeTab === 'expenses') {
      return userAccountIds.includes(t.source_account_id || 0);
    }

    return true;
  });

  // Grouper par date
  const groupedTransactions = filteredTransactions.reduce((acc: any, transaction: Transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString('fr-FR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

  // Pagination
  const totalPages = Math.ceil(Object.keys(groupedTransactions).length / itemsPerPage);
  const paginatedDates = Object.keys(groupedTransactions).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculs des totaux
  const totalEntries = filteredTransactions
    .filter((t: Transaction) => userAccountIds.includes(t.destination_account_id || 0))
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t: Transaction) => userAccountIds.includes(t.source_account_id || 0) && !userAccountIds.includes(t.destination_account_id || 0))
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  // Fonction pour télécharger le relevé PDF
  const handleDownloadStatement = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(0, 105, 105);
    doc.text('FINVO', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relevé de transactions', 105, 30, { align: 'center' });
    
    // Informations du relevé
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    doc.text(`Date d'édition: ${now.toLocaleDateString('fr-FR')}`, 14, 45);
    
    const selectedAccountName = selectedAccount === 'all' 
      ? 'Tous les comptes' 
      : accounts.find(acc => acc.id.toString() === selectedAccount)?.account_number || 'N/A';
    doc.text(`Compte: ${selectedAccountName}`, 14, 50);
    
    const monthLabel = selectedMonth === 'all' 
      ? 'Toutes les périodes' 
      : (() => {
          const months = [
            { label: 'Novembre 2024', value: '2024-11' },
            { label: 'Octobre 2024', value: '2024-10' },
            { label: 'Septembre 2024', value: '2024-09' },
            { label: 'Août 2024', value: '2024-08' },
            { label: 'Juillet 2024', value: '2024-07' },
            { label: 'Juin 2024', value: '2024-06' },
          ];
          return months.find(m => m.value === selectedMonth)?.label || selectedMonth;
        })();
    doc.text(`Période: ${monthLabel}`, 14, 55);
    
    // Résumé
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Résumé', 14, 70);
    
    doc.setFontSize(10);
    doc.text(`Entrées: ${totalEntries.toFixed(2)}€`, 14, 77);
    doc.text(`Sorties: ${totalExpenses.toFixed(2)}€`, 14, 82);
    doc.text(`Nombre de transactions: ${filteredTransactions.length}`, 14, 87);
    
    // Table des transactions
    const tableData = filteredTransactions.map((t: Transaction) => {
      const isCredit = userAccountIds.includes(t.destination_account_id || 0);
      const isDebit = userAccountIds.includes(t.source_account_id || 0);
      const amount = isDebit && !isCredit ? `-${t.amount.toFixed(2)}€` : `+${t.amount.toFixed(2)}€`;
      
      return [
        new Date(t.created_at).toLocaleDateString('fr-FR'),
        t.description || 'Transaction',
        t.transaction_type,
        amount
      ];
    });
    
    autoTable(doc, {
      startY: 95,
      head: [['Date', 'Description', 'Type', 'Montant']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 105, 105] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 70 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Télécharger
    const filename = `releve-finvo-${now.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

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
          <TransactionsHeader
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDownload={handleDownloadStatement}
          />

          <div style={styles.transactionContainer}>
            <TransactionTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div style={styles.mainContentLayout}>
              <div style={styles.transactionColumn}>
                <div style={styles.transactionList}>
                  {paginatedDates.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
                      Aucune transaction trouvée
                    </p>
                  ) : (
                    paginatedDates.map((date) => (
                      <Fragment key={date}>
                        <DateHeader date={date} />
                        {groupedTransactions[date].map((t: Transaction) => (
                          <TransactionRow
                            key={t.id}
                            transaction={t}
                            userAccountIds={userAccountIds}
                          />
                        ))}
                      </Fragment>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>

              <SummarySidebar
                totalEntries={totalEntries}
                totalExpenses={totalExpenses}
                transactionCount={filteredTransactions.length}
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

const ACCENT_COLOR = '#006969';
const LIGHT_TURQUOISE_TRANSPARENT = 'rgba(0, 128, 128, 0.05)';
const HEADER_BG_COLOR = 'rgba(198, 229, 241, 0.3)';

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundImage: `linear-gradient(to bottom right, #ffffff, ${LIGHT_TURQUOISE_TRANSPARENT})`,
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '0',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    width: '100%',
  },
  headerControlsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: HEADER_BG_COLOR,
    padding: '30px 0',
    marginBottom: '20px',
  },
  headerContentContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
  },
  headerTitles: {
    flex: 1,
  },
  mainTitle: {
    fontSize: '2.4em',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#020202',
  },
  subTitle: {
    fontSize: '0.9em',
    margin: 0,
    color: '#333',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  dropdownContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  dropdownStyle: {
    appearance: 'none',
    backgroundColor: 'white',
    color: '#333',
    padding: '10px 30px 10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    outline: 'none',
    width: '180px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  dropdownArrow: {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#333',
  },
  downloadButton: {
    backgroundColor: 'white',
    color: ACCENT_COLOR,
    border: `1px solid ${ACCENT_COLOR}`,
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  downloadButtonHover: {
    backgroundColor: ACCENT_COLOR,
    color: 'white',
  },
  downloadIcon: {
    fontSize: '1.2em',
  },
  transactionContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '95%',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    margin: '0 auto',
  },
  topNavigation: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #eee',
  },
  navTabs: {
    display: 'flex',
    gap: '15px',
  },
  navTab: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: '500',
    color: '#888',
    transition: 'all 0.2s ease-in-out',
  },
  navTabActive: {
    backgroundColor: '#f0f4f8',
    color: '#333',
    fontWeight: '600',
  },
  mainContentLayout: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
    padding: '30px 40px',
  },
  transactionColumn: {
    flex: 3,
    minWidth: '60%',
    backgroundColor: 'white',
  },
  summarySidebar: {
    flex: 1,
    minWidth: '300px',
    maxWidth: '350px',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  },
  summaryCardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  summaryIcon: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2em',
    marginRight: '15px',
    fontWeight: 'bold',
  },
  summaryLabelCard: {
    margin: 0,
    fontSize: '1em',
    color: '#666',
    fontWeight: '500',
  },
  summaryValueCard: {
    margin: '10px 0 0 0',
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#333',
  },
  transactionList: {},
  dateHeaderContainer: {
    padding: '15px 0 10px 0',
    marginTop: '25px',
    marginBottom: '10px',
    textAlign: 'left',
  },
  dateHeaderText: {
    margin: 0,
    fontSize: '0.9em',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  transactionIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '15px',
    fontSize: '1.2em',
    color: '#555',
  },
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  transactionDescription: {
    fontSize: '1em',
    fontWeight: 'normal',
    color: '#333',
  },
  descriptionText: {
    margin: 0,
    fontWeight: '600',
  },
  accountText: {
    margin: '3px 0 0 0',
    fontSize: '0.8em',
    color: '#999',
    fontWeight: 'normal',
  },
  amountText: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    margin: 0,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '5px',
    marginTop: '30px',
    paddingLeft: '55px',
  },
  paginationButton: {
    padding: '8px 12px',
    backgroundColor: 'white',
    color: ACCENT_COLOR,
    border: `1px solid ${ACCENT_COLOR}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out',
  },
  paginationNumbers: {
    display: 'flex',
    gap: '5px',
  },
  pageNumberButton: {
    padding: '8px 12px',
    backgroundColor: 'white',
    color: '#c1dedd',
    border: '1px solid #c1dedd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
  },
  currentPageButton: {
    padding: '8px 12px',
    backgroundColor: '#26918F',
    color: 'white',
    border: '1px solid #26918F',
    borderRadius: '8px',
    cursor: 'default',
    fontWeight: 'bold',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '1.2rem',
    color: ACCENT_COLOR,
  },
};

export default TransactionsPage;