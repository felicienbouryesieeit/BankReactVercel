import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { TransferStep1 } from '../components/Transfer/TransferStep1';
import { TransferStep2 } from '../components/Transfer/TransferStep2';
import { TransferStep3 } from '../components/Transfer/TransferStep3';

export const TransferPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [transferType, setTransferType] = useState<'internal' | 'external' | null>(null);
  const [transferData, setTransferData] = useState<{
    sourceAccountId: number;
    sourceAccountNumber: string;
    destinationAccountNumber: string;
    amount: number;
    description: string;
  } | null>(null);

  // ID utilisateur depuis localStorage
  const userId = parseInt(localStorage.getItem('user_id') || '0');

  const { data: accounts = [], refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts', userId],
    queryFn: () => api.getUserAccounts(userId),
    enabled: userId > 0,
  });

  const { data: beneficiaries = [], refetch: refetchBeneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => api.getBeneficiaries(),
    enabled: userId > 0,
  });

  const handleStep1Next = (type: 'internal' | 'external') => {
    setTransferType(type);
    setCurrentStep(2);
  };

  const handleStep2Next = (data: {
    sourceAccountId: number;
    destinationAccountNumber: string;
    amount: number;
    description: string;
  }) => {
    const sourceAccount = accounts.find((acc) => acc.id === data.sourceAccountId);
    
    setTransferData({
      ...data,
      sourceAccountNumber: sourceAccount?.account_number || '',
    });
    setCurrentStep(3);
  };

  const handleNewTransfer = () => {
    setCurrentStep(1);
    setTransferType(null);
    setTransferData(null);
    refetchAccounts();
  };

  return (
  <Layout>
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-8">
        {currentStep < 3 && (
          <div className="bg-white rounded-xl p-6 shadow-card mb-8">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= 1
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  1
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:inline ${
                    currentStep >= 1 ? 'text-secondary' : 'text-neutral-400'
                  }`}
                >
                  Type de virement
                </span>
              </div>

              {/* Ligne */}
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-neutral-200'
                }`}
              />

              {/* Step 2 */}
              <div className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= 2
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  2
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:inline ${
                    currentStep >= 2 ? 'text-secondary' : 'text-neutral-400'
                  }`}
                >
                  Bénéficiaire
                </span>
              </div>

              {/* Ligne */}
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep >= 3 ? 'bg-primary' : 'bg-neutral-200'
                }`}
              />

              {/* Step 3 */}
              <div className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= 3
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  3
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:inline ${
                    currentStep >= 3 ? 'text-secondary' : 'text-neutral-400'
                  }`}
                >
                  Confirmation
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-card">
          {/* Type de virement */}
          {currentStep === 1 && <TransferStep1 onNext={handleStep1Next} />}

          {/* Bénéficiaire */}
          {currentStep === 2 && transferType && (
            <TransferStep2
              transferType={transferType}
              accounts={accounts}
              beneficiaries={beneficiaries}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
              onBeneficiariesUpdated={() => refetchBeneficiaries()}
            />
          )}

          {/* Confirmation */}
          {currentStep === 3 && transferData && (
            <TransferStep3
              sourceAccountId={transferData.sourceAccountId}
              sourceAccountNumber={transferData.sourceAccountNumber}
              destinationAccountNumber={transferData.destinationAccountNumber}
              amount={transferData.amount}
              description={transferData.description}
              onNewTransfer={handleNewTransfer}
            />
          )}
        </div>
      </div>
    </div>
  </Layout>
  );
};