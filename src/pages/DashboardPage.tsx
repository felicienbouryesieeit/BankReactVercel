import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { api, User, DashboardAccount } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Transaction {
    id: number;
    amount: number;
    created_at: string;
    is_income: boolean;
    is_expense: boolean;
    is_internal: boolean;
    is_cancelled: boolean;
    source_account_id: number | null;
    destination_account_id: number | null;
}

export const DashboardPage = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedAccount, setSelectedAccount] = useState<string>('all');
    const [user, setUser] = useState<User | null>(null);

    // Récupérer les données du dashboard
    const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.getDashboardStats(),
    });

    // Récupérer les infos de l'utilisateur connecté
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await api.getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error('Erreur lors de la récupération de l’utilisateur', err);
            }
        };

        fetchUser();
    }, []);

    // Générer la liste des mois disponibles
    const availableMonths = useMemo(() => {
        const months = [];
        const currentDate = new Date();
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            months.push({
                value: monthValue,
                label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
            });
        }
        
        return months;
    }, []);

    // Filtrer les transactions selon les sélections
    const filteredTransactions = useMemo(() => {
        if (!dashboardData?.transactions) return [];

        let filtered = dashboardData.transactions.filter(t => !t.is_cancelled);

        // Filtre par mois
        if (selectedMonth !== 'all') {
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.created_at);
                const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                return transactionMonth === selectedMonth;
            });
        }

        // Filtre par compte
        if (selectedAccount !== 'all') {
            const accountId = parseInt(selectedAccount);
            filtered = filtered.filter(t => 
                t.source_account_id === accountId || 
                t.destination_account_id === accountId
            );
        }

        return filtered;
    }, [dashboardData?.transactions, selectedMonth, selectedAccount]);

    // Calculer les statistiques filtrées
    const filteredStats = useMemo(() => {
        const totalBalance = selectedAccount === 'all' 
            ? (dashboardData?.total_balance || 0)
            : (dashboardData?.accounts.find(acc => acc.id.toString() === selectedAccount)?.balance || 0);

        const totalIncome = filteredTransactions
            .filter(t => t.is_income)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTransactions
            .filter(t => t.is_expense)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalBalance,
            totalIncome,
            totalExpense
        };
    }, [filteredTransactions, selectedAccount, dashboardData]);

    if (isDashboardLoading || !user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl text-gray-600">Chargement...</div>
                </div>
            </Layout>
        );
    }

    const accounts = dashboardData?.accounts || [];

    // Préparer les données pour les graphiques avec les transactions filtrées
    const balanceData = prepareBalanceEvolution(filteredTransactions, filteredStats.totalBalance);
    const incomeData = prepareIncomeEvolution(filteredTransactions);
    const cashFlowData = prepareCashFlow(filteredTransactions);

    return (
        <Layout>
            <div className="min-h-screen bg-neutral-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* En-tête avec filtres alignés à droite */}
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-secondary mb-2">
                                Bonjour {user.first_name}
                            </h1>
                            <p className="text-neutral-500">
                                {new Date().toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        
                        {/* Filtres alignés à droite */}
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-sm min-w-40"
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                            >
                                <option value="all">Tous mes comptes</option>
                                {accounts.map((account: DashboardAccount) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_number} {account.is_main && '(Principal)'}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-sm min-w-40"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="all">Tous les mois</option>
                                {availableMonths.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cartes de statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Solde */}
                        <div className="bg-white rounded-xl p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                </div>
                                <span className="text-neutral-600 font-medium">Solde</span>
                            </div>
                            <div className="text-3xl font-bold text-secondary mb-4">
                                {filteredStats.totalBalance.toFixed(2)}€
                            </div>
                            {balanceData.datasets[0].data.length > 0 && (
                                <div className="h-24">
                                    <Line
                                        data={balanceData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { display: false },
                                                y: { display: false },
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Entrées */}
                        <div className="bg-white rounded-xl p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-cyan-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </svg>
                                </div>
                                <span className="text-neutral-600 font-medium">Entrées</span>
                            </div>
                            <div className="text-3xl font-bold text-secondary mb-4">
                                {filteredStats.totalIncome.toFixed(2)}€
                            </div>
                            {incomeData.datasets[0].data.length > 0 && (
                                <div className="h-24">
                                    <Line
                                        data={incomeData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { display: false },
                                                y: { display: false },
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sorties */}
                        <div className="bg-white rounded-xl p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-orange-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                                        />
                                    </svg>
                                </div>
                                <span className="text-neutral-600 font-medium">Sorties</span>
                            </div>
                            <div className="text-3xl font-bold text-secondary mb-4">
                                {filteredStats.totalExpense.toFixed(2)}€
                            </div>
                            {incomeData.datasets[0].data.length > 0 && (
                                <div className="h-24">
                                    <Line
                                        data={{
                                            labels: incomeData.labels,
                                            datasets: [
                                                {
                                                    data: incomeData.datasets[0].data,
                                                    borderColor: '#fb923c',
                                                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                                                    tension: 0.4,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { display: false },
                                                y: { display: false },
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flux de trésorerie */}
                    <div className="bg-white rounded-xl p-6 shadow-card mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-secondary">
                                Flux de trésorerie
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                <span className="text-neutral-600">Solde</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                <span className="text-neutral-600">Entrées</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-neutral-600">Sorties</span>
                            </div>
                        </div>
                        <div className="h-80">
                            <Chart
                                type="bar"
                                data={cashFlowData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value) => `${value}€`,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Transactions récentes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-secondary">
                                    Transactions récentes
                                    {selectedMonth !== 'all' && ` - ${availableMonths.find(m => m.value === selectedMonth)?.label}`}
                                    {selectedAccount !== 'all' && ` - Compte ${accounts.find(acc => acc.id.toString() === selectedAccount)?.account_number}`}
                                </h2>
                                <button
                                    onClick={() => window.location.href = '/transactions'}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Toutes les transactions
                                </button>
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <p className="text-center text-neutral-500 py-8">
                                    Aucune transaction {selectedMonth !== 'all' || selectedAccount !== 'all' ? 'pour les filtres sélectionnés' : ''}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTransactions.slice(0, 5).map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 rounded-lg hover:bg-neutral-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-neutral-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary">
                                                        {transaction.is_income
                                                            ? 'Réception'
                                                            : transaction.is_expense
                                                                ? 'Paiement'
                                                                : 'Transfert interne'}
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`font-bold ${transaction.is_income
                                                    ? 'text-green-600'
                                                    : transaction.is_expense
                                                        ? 'text-red-600'
                                                        : 'text-neutral-600'
                                                    }`}
                                            >
                                                {transaction.is_income ? '+' : transaction.is_expense ? '-' : ''}
                                                {transaction.amount.toFixed(2)}€
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Raccourcis */}
                        <div className="bg-white rounded-xl p-6 shadow-card">
                            <h2 className="text-xl font-bold text-secondary mb-6">Raccourcis</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.href = '/transfer'}
                                    className="w-full flex items-center justify-between p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-primary"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-secondary">
                                                Envoyer de l'argent
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Virement à vos bénéficiaires
                                            </p>
                                        </div>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-neutral-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => window.location.href = '/beneficiaires'}
                                    className="w-full flex items-center justify-between p-4 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-cyan-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-secondary">
                                                Ajouter un bénéficiaire
                                            </p>
                                            <p className="text-sm text-neutral-500">Gérer la liste</p>
                                        </div>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-neutral-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => window.location.href = '/comptes'}
                                    className="w-full flex items-center justify-between p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-secondary">
                                                Ajouter des fonds
                                            </p>
                                            <p className="text-sm text-neutral-500">Créditer votre compte</p>
                                        </div>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-neutral-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Fonctions utilitaires pour préparer les données des graphiques (restent identiques)

function prepareBalanceEvolution(transactions: Transaction[], currentBalance: number) {
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const labels: string[] = [];
    const data: number[] = [];

    let balance = currentBalance;

    // Recalculer le solde en partant de la fin
    for (let i = sortedTransactions.length - 1; i >= 0; i--) {
        const t = sortedTransactions[i];
        if (t.is_income) {
            balance -= t.amount;
        } else if (t.is_expense) {
            balance += t.amount;
        }
    }

    // Construire les données du graphique
    for (const t of sortedTransactions) {
        if (t.is_income) {
            balance += t.amount;
        } else if (t.is_expense) {
            balance -= t.amount;
        }

        labels.push(new Date(t.created_at).toLocaleDateString('fr-FR'));
        data.push(balance);
    }

    return {
        labels,
        datasets: [
            {
                data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };
}

function prepareIncomeEvolution(transactions: Transaction[]) {
    const incomeTransactions = transactions.filter(t => t.is_income);
    const sortedTransactions = [...incomeTransactions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const labels = sortedTransactions.map(t =>
        new Date(t.created_at).toLocaleDateString('fr-FR')
    );
    const data = sortedTransactions.map(t => t.amount);

    return {
        labels,
        datasets: [
            {
                data,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                tension: 0.4,
            },
        ],
    };
}

function prepareCashFlow(transactions: Transaction[]) {
    const monthlyData: { [key: string]: { income: number; expense: number; balance: number } } = {};

    // Initialiser les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = { income: 0, expense: 0, balance: 0 };
    }

    // Agréger les transactions par mois
    transactions.forEach(t => {
        const date = new Date(t.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (monthlyData[monthKey]) {
            if (t.is_income) {
                monthlyData[monthKey].income += t.amount;
            } else if (t.is_expense) {
                monthlyData[monthKey].expense += t.amount;
            }
        }
    });

    // Calculer le solde cumulé
    let cumulativeBalance = 0;
    Object.keys(monthlyData).forEach(key => {
        cumulativeBalance += monthlyData[key].income - monthlyData[key].expense;
        monthlyData[key].balance = cumulativeBalance;
    });

    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', {
            month: 'short',
        });
    });

    return {
        labels,
        datasets: [
            {
                label: 'Entrées',
                data: Object.values(monthlyData).map(d => d.income),
                backgroundColor: '#37C1BE',
            },
            {
                label: 'Sorties',
                data: Object.values(monthlyData).map(d => d.expense),
                backgroundColor: '#fb923c',
            },
            {
                label: 'Solde',
                data: Object.values(monthlyData).map(d => d.balance),
                type: 'line' as const,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };
}