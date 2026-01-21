import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransferPage } from './pages/TransferPage';
import { DashboardPage } from './pages/DashboardPage';
import LoginForm from './components/Connexion';
import RegisterForm from './components/Inscription';
import ProfilePage from './components/Profil';
import BeneficiariesPage from './components/Beneficiary';
import AccountsPage from './components/Accounts';
import TransactionsPage from './components/TransactionHistory';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Navigate to="/connexion" replace />} />
          <Route path="/connexion" element={<LoginForm />} />
          <Route path="/inscription" element={<RegisterForm />} />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <ProtectedRoute>
                <TransferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiaires"
            element={
              <ProtectedRoute>
                <BeneficiariesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptes"
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;