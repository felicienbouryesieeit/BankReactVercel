import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import jsPDF from 'jspdf';

interface TransferStep3Props {
  sourceAccountId: number;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string;
  onNewTransfer: () => void;
}

export const TransferStep3 = ({
  sourceAccountId,
  sourceAccountNumber,
  destinationAccountNumber,
  amount,
  description,
  onNewTransfer,
}: TransferStep3Props) => {
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isCancelled, setIsCancelled] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);

  const transferMutation = useMutation({
    mutationFn: () =>
      api.transferMoney(sourceAccountId, destinationAccountNumber, amount),
    onSuccess: (data) => {
      setTransactionId(data.transaction.id);
      setTransferData(data);
      setShowCancelToast(true);
    },
  });

  // Pour annuler la transaction
  const cancelMutation = useMutation({
    mutationFn: () => api.cancelTransaction(transactionId!),
    onSuccess: () => {
      setIsCancelled(true);
      setShowCancelToast(false);
    },
    onError: (error: Error) => {
      if (error.message.includes('délai') || error.message.includes('5 secondes')) {
        setShowCancelToast(false);
      }
    },
  });

  // Toast d'annulation
  useEffect(() => {
    if (!showCancelToast || isCancelled) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowCancelToast(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showCancelToast, isCancelled]);

  useEffect(() => {
    if (!transactionId && !transferMutation.isPending && !transferMutation.isSuccess) {
      transferMutation.mutate();
    }
  }, []);

  const progressPercentage = ((5 - timeLeft) / 5) * 100;

  // Fonction pour télécharger le reçu PDF
  const handleDownloadReceipt = () => {
    if (!transferData) return;

    const doc = new jsPDF();
    const now = new Date();

    // En-tête avec logo/titre
    doc.setFillColor(0, 105, 105);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FINVO', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Reçu de virement', 105, 30, { align: 'center' });

    // Informations générales
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'émission: ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, 14, 55);
    doc.text(`Numéro de transaction: #${transferData.transaction.id}`, 14, 60);

    // Statut
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80);
    doc.text('VIREMENT EFFECTUÉ', 105, 75, { align: 'center' });

    // Cadre pour les détails
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, 85, 182, 85, 3, 3);

    // Détails du virement
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('bold');
    doc.text('Détails du virement', 20, 95);
    doc.setFont('normal');

    // Compte débité
    doc.setTextColor(100, 100, 100);
    doc.text('Compte débité', 20, 105);
    doc.setTextColor(0, 0, 0);
    doc.setFont('bold');
    doc.text(sourceAccountNumber, 20, 110);
    doc.setFont('normal');

    // Compte crédité
    doc.setTextColor(100, 100, 100);
    doc.text('Compte crédité', 20, 125);
    doc.setTextColor(0, 0, 0);
    doc.setFont('bold');
    doc.text(destinationAccountNumber, 20, 130);
    doc.setFont('normal');

    // Bénéficiaire
    if (transferData.destination_account?.user) {
      doc.setTextColor(100, 100, 100);
      doc.text('Bénéficiaire', 20, 145);
      doc.setTextColor(0, 0, 0);
      doc.setFont('bold');
      const beneficiaryName = `${transferData.destination_account.user.first_name} ${transferData.destination_account.user.last_name}`;
      doc.text(beneficiaryName, 20, 150);
      doc.setFont('normal');
    }

    // Libellé
    if (description) {
      doc.setTextColor(100, 100, 100);
      doc.text('Libellé', 110, 105);
      doc.setTextColor(0, 0, 0);
      const maxWidth = 80;
      const lines = doc.splitTextToSize(description, maxWidth);
      doc.text(lines, 110, 110);
    }

    // Montant (en gros et encadré)
    doc.setDrawColor(0, 105, 105);
    doc.setFillColor(240, 248, 255);
    doc.setLineWidth(1);
    doc.roundedRect(14, 180, 182, 25, 3, 3, 'FD');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('Montant transféré', 105, 190, { align: 'center' });
    
    doc.setTextColor(0, 105, 105);
    doc.setFontSize(20);
    doc.setFont('bold');
    doc.text(`${amount.toFixed(2)} €`, 105, 200, { align: 'center' });
    doc.setFont('normal');

    // Note de bas de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Ce document certifie l\'exécution du virement bancaire.', 105, 220, { align: 'center' });
    doc.text('Conservez ce reçu pour vos archives.', 105, 225, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 235, 196, 235);

    // Contact et informations
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('FINVO - Banque en ligne', 105, 245, { align: 'center' });

    // Pied de page avec numéro de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Télécharger
    const filename = `recu-virement-${transactionId}-${now.toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Toast d'annulation */}
      {showCancelToast && !isCancelled && transactionId && (
        <div className="fixed bottom-24 left-24 bg-white px-6 py-4 rounded-xl shadow-xl z-[1100] w-96 animate-slide-in-left">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex-1">
              <p
                className="font-bold text-secondary whitespace-nowrap overflow-hidden"
                style={{
                  fontSize: 'clamp(0.75rem, 1vw, 1rem)',
                }}
              >
                Vous venez d'effectuer un virement
              </p>
            </div>
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-warning text-secondary font-bold px-6 py-3 rounded-lg hover:bg-warning/90 transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
            >
              {cancelMutation.isPending ? 'Annulation...' : 'Annuler'}
            </button>
          </div>
          {/* Barre de progression */}
          <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Chargement */}
      {transferMutation.isPending && (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Virement en cours...
            </h2>
            <p className="text-neutral-600">Veuillez patienter</p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {transferMutation.isError && (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Erreur lors du virement
            </h2>
            <p className="text-danger mb-4">{transferMutation.error.message}</p>
          </div>
          <button
            onClick={onNewTransfer}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Succès */}
      {transferMutation.isSuccess && (
        <div className="text-center space-y-6">
          {/* Icon succès ou annulation */}
          <div className="flex justify-center">
            {isCancelled ? (
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              {isCancelled ? 'Virement annulé' : 'Virement envoyé !'}
            </h2>
            <p className="text-neutral-600">
              {isCancelled
                ? 'Votre virement a été annulé avec succès'
                : 'Votre virement a été effectué avec succès'}
            </p>
          </div>

          {/* Détails du virement */}
          {!isCancelled && (
            <div className="bg-neutral-50 rounded-xl p-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Compte débité</span>
                <span className="font-medium text-secondary">
                  {sourceAccountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Compte crédité</span>
                <span className="font-medium text-secondary">
                  {destinationAccountNumber}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200">
                <span className="text-neutral-600">Montant</span>
                <span className="text-2xl font-bold text-primary">
                  {amount.toFixed(2)}€
                </span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Libellé</span>
                  <span className="font-medium text-secondary">{description}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-4">
            {!isCancelled && (
              <button
                onClick={handleDownloadReceipt}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Télécharger reçu
              </button>
            )}
            <button
              onClick={onNewTransfer}
              className="w-full bg-white border-3 border-secondary text-secondary font-bold py-3 px-6 rounded-xl hover:bg-neutral-50 transition-colors duration-200"
            >
              Nouveau virement
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};