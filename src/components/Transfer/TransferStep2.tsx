import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Account, Beneficiary } from '../../services/api';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

interface TransferStep2Props {
  transferType: 'internal' | 'external';
  accounts: Account[];
  beneficiaries: Beneficiary[];
  onNext: (data: {
    sourceAccountId: number;
    destinationAccountNumber: string;
    amount: number;
    description: string;
  }) => void;
  onBack: () => void;
  onBeneficiariesUpdated: () => void;
}

const internalValidationSchema = Yup.object({
  sourceAccountId: Yup.number().required('Veuillez sélectionner un compte à débiter'),
  destinationAccountNumber: Yup.string().required('Veuillez sélectionner un compte à créditer'),
  amount: Yup.number()
    .required('Le montant est requis')
    .positive('Le montant doit être positif'),
  description: Yup.string(),
});

const addBeneficiarySchema = Yup.object({
  beneficiaryName: Yup.string().required('Le nom est requis'),
  beneficiaryAccountNumber: Yup.string()
    .required('Le numéro de compte est requis')
    .matches(/^FR\d{8}$/, 'Format invalide (ex: FR12345678)'),
});

export const TransferStep2 = ({
  transferType,
  accounts,
  beneficiaries,
  onNext,
  onBack,
  onBeneficiariesUpdated,
}: TransferStep2Props) => {
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showAmountStep, setShowAmountStep] = useState(false);

  const addBeneficiaryMutation = useMutation({
    mutationFn: ({ name, accountNumber }: { name: string; accountNumber: string }) =>
      api.addBeneficiary(name, accountNumber),
    onSuccess: () => {
      setShowAddBeneficiary(false);
      onBeneficiariesUpdated();
    },
  });

  const searchedBeneficiaries = beneficiaries.filter(
    (ben) =>
      ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.account_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowAmountStep(true);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-secondary mb-8 text-center">
        Choisir un bénéficiaire
      </h2>

      {/* VIREMENT INTERNE */}
      {transferType === 'internal' && (
        <Formik
          initialValues={{
            sourceAccountId: '',
            destinationAccountNumber: '',
            amount: '',
            description: '',
          }}
          validationSchema={internalValidationSchema}
          onSubmit={(values) => {
            onNext({
              sourceAccountId: parseInt(values.sourceAccountId),
              destinationAccountNumber: values.destinationAccountNumber,
              amount: parseFloat(values.amount),
              description: values.description,
            });
          }}
        >
          {({ errors, touched, values }) => {
            const sourceAccount = accounts.find(
              (acc) => acc.id === parseInt(values.sourceAccountId)
            );
            const sourceBalance = sourceAccount?.balance || 0;

            return (
              <Form className="space-y-6">
                {/* Compte à débiter */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Compte à débiter
                  </label>
                  <Field
                    as="select"
                    name="sourceAccountId"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts
                      .filter((account) => !account.is_closed)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.is_main ? 'Compte principal' : 'Compte secondaire'} - {account.account_number} - {account.balance.toFixed(2)}€
                        </option>
                      ))}
                  </Field>
                  {errors.sourceAccountId && touched.sourceAccountId && (
                    <p className="mt-1 text-sm text-danger">{errors.sourceAccountId}</p>
                  )}
                </div>

                {/* Compte à créditer */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Compte à créditer
                  </label>
                  <Field
                    as="select"
                    name="destinationAccountNumber"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts
                      .filter(
                        (acc) =>
                          !acc.is_closed && acc.id !== parseInt(values.sourceAccountId)
                      )
                      .map((account) => (
                        <option key={account.id} value={account.account_number}>
                          {account.is_main ? 'Compte principal' : 'Compte secondaire'} - {account.account_number} - {account.balance.toFixed(2)}€
                        </option>
                      ))}
                  </Field>
                  {errors.destinationAccountNumber && touched.destinationAccountNumber && (
                    <p className="mt-1 text-sm text-danger">
                      {errors.destinationAccountNumber}
                    </p>
                  )}
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Montant
                  </label>
                  <div className="relative">
                    <Field
                      type="number"
                      name="amount"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                      validate={(value: string) => {
                        const numValue = parseFloat(value);
                        if (!value) return 'Le montant est requis';
                        if (numValue <= 0) return 'Le montant doit être positif';
                        if (numValue > sourceBalance) return 'Solde insuffisant';
                        if (numValue > 10000) return 'Limite journalière dépassée (10 000€)';
                        return undefined;
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      €
                    </span>
                  </div>
                  {errors.amount && touched.amount && (
                    <p className="mt-1 text-sm text-danger">{errors.amount}</p>
                  )}
                  <p className="mt-2 text-sm text-neutral-500">
                    Solde disponible: {sourceBalance.toFixed(2)}€
                  </p>
                </div>

                {/* Libellé (facultatif) */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Libellé (facultatif)
                  </label>
                  <Field
                    type="text"
                    name="description"
                    placeholder="Ex: Remboursement"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Boutons */}
                <div className="flex justify-between pt-4 px-2">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-32 bg-white border-2 border-black text-secondary font-bold py-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-center"
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    className="w-32 bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-lg transition-colors duration-200 text-center"
                  >
                    Suivant
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}

      {/* VIREMENT EXTERNE */}
      {transferType === 'external' && !showAmountStep && (
        <div className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Rechercher un bénéficiaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddBeneficiary(true)}
            className="w-full px-4 py-3 border-2 border-primary text-primary font-medium rounded-xl hover:bg-primary/5 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Ajouter un bénéficiaire
          </button>

          {/* Liste des bénéficiaires */}
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {searchedBeneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                type="button"
                onClick={() => handleBeneficiarySelect(beneficiary)}
                className="w-full flex items-center justify-between p-4 border-2 border-neutral-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div>
                  <p className="font-medium text-secondary">{beneficiary.name}</p>
                  <p className="text-sm text-neutral-500">
                    {beneficiary.account_number}
                  </p>
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
            ))}

            {searchedBeneficiaries.length === 0 && (
              <p className="text-center text-neutral-500 py-8">
                Aucun bénéficiaire trouvé
              </p>
            )}
          </div>

          {/* Bouton retour */}
          <div className="flex justify-between pt-4 px-2">
            <button
              type="button"
              onClick={onBack}
              className="w-32 bg-white border-2 border-black text-secondary font-bold py-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-center"
            >
              Précédent
            </button>
            <button
              type="submit"
              className="w-32 bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-lg transition-colors duration-200 text-center"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Montant et libellé */}
      {transferType === 'external' && showAmountStep && selectedBeneficiary && (
        <Formik
          initialValues={{
            sourceAccountId: '',
            amount: '',
            description: '',
          }}
          validationSchema={Yup.object({
            sourceAccountId: Yup.number().required('Veuillez sélectionner un compte'),
            amount: Yup.number()
              .required('Le montant est requis')
              .positive('Le montant doit être positif'),
          })}
          onSubmit={(values) => {
            onNext({
              sourceAccountId: parseInt(values.sourceAccountId),
              destinationAccountNumber: selectedBeneficiary.account_number,
              amount: parseFloat(values.amount),
              description: values.description,
            });
          }}
        >
          {({ errors, touched, values }) => {
            const sourceAccount = accounts.find(
              (acc) => acc.id === parseInt(values.sourceAccountId)
            );
            const sourceBalance = sourceAccount?.balance || 0;

            return (
              <Form className="space-y-6">
                {/* Bénéficiaire sélectionné */}
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <p className="text-sm text-neutral-600 mb-1">Bénéficiaire</p>
                  <p className="font-medium text-secondary">{selectedBeneficiary.name}</p>
                  <p className="text-sm text-neutral-500">
                    {selectedBeneficiary.account_number}
                  </p>
                </div>

                {/* Compte à débiter */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Compte à débiter
                  </label>
                  <Field
                    as="select"
                    name="sourceAccountId"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts
                    .filter((account) => !account.is_closed)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.is_main ? 'Compte principal' : 'Compte secondaire'} - {account.account_number} - {account.balance.toFixed(2)}€
                      </option>
                    ))}
                  </Field>
                  {errors.sourceAccountId && touched.sourceAccountId && (
                    <p className="mt-1 text-sm text-danger">{errors.sourceAccountId}</p>
                  )}
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Montant
                  </label>
                  <div className="relative">
                    <Field
                      type="number"
                      name="amount"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                      validate={(value: string) => {
                        const numValue = parseFloat(value);
                        if (!value) return 'Le montant est requis';
                        if (numValue <= 0) return 'Le montant doit être positif';
                        if (numValue > sourceBalance) return 'Solde insuffisant';
                        if (numValue > 10000) return 'Limite journalière dépassée (10 000€)';
                        return undefined;
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      €
                    </span>
                  </div>
                  {errors.amount && touched.amount && (
                    <p className="mt-1 text-sm text-danger">{errors.amount}</p>
                  )}
                  <p className="mt-2 text-sm text-neutral-500">
                    Solde disponible: {sourceBalance.toFixed(2)}€
                  </p>
                </div>

                {/* Libellé (facul) */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Libellé (facultatif)
                  </label>
                  <Field
                    type="text"
                    name="description"
                    placeholder="Ex: Cadeau anniversaire"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Boutons */}
                <div className="flex justify-between pt-4 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAmountStep(false);
                      setSelectedBeneficiary(null);
                    }}
                    className="w-32 bg-white border-2 border-black text-secondary font-bold py-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-center"
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    className="w-32 bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-lg transition-colors duration-200 text-center"
                  >
                    Suivant
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}

      {showAddBeneficiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-secondary mb-4">
              Ajouter un bénéficiaire
            </h3>

            <Formik
              initialValues={{
                beneficiaryName: '',
                beneficiaryAccountNumber: '',
              }}
              validationSchema={addBeneficiarySchema}
              onSubmit={(values) => {
                addBeneficiaryMutation.mutate({
                  name: values.beneficiaryName,
                  accountNumber: values.beneficiaryAccountNumber,
                });
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Nom du bénéficiaire
                    </label>
                    <Field
                      type="text"
                      name="beneficiaryName"
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.beneficiaryName && touched.beneficiaryName && (
                      <p className="mt-1 text-sm text-danger">
                        {errors.beneficiaryName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Numéro de compte
                    </label>
                    <Field
                      type="text"
                      name="beneficiaryAccountNumber"
                      placeholder="FR12345678"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.beneficiaryAccountNumber &&
                      touched.beneficiaryAccountNumber && (
                        <p className="mt-1 text-sm text-danger">
                          {errors.beneficiaryAccountNumber}
                        </p>
                      )}
                  </div>

                  {addBeneficiaryMutation.isError && (
                    <p className="text-sm text-danger">
                      {addBeneficiaryMutation.error.message}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBeneficiary(false)}
                      className="flex-1 bg-white border-2 border-neutral-300 text-secondary font-medium py-3 px-6 rounded-xl hover:bg-neutral-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={addBeneficiaryMutation.isPending}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl disabled:opacity-50"
                    >
                      {addBeneficiaryMutation.isPending ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};