import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from './Layout';
import { api } from '../services/api';

interface Beneficiary {
  id: number;
  name: string;
  account_number: string;
  user_id: number;
  added_at: string;
}

interface BeneficiaryFormData {
  name: string;
  account_number: string;
}

const BeneficiariesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    name: '',
    account_number: ''
  });
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const queryClient = useQueryClient();

  // Récupération des bénéficiaires
  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => api.getBeneficiaries(),
  });

  // Mutation pour ajouter un bénéficiaire
  const addBeneficiaryMutation = useMutation({
    mutationFn: (data: BeneficiaryFormData) =>
      api.addBeneficiary(data.name, data.account_number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setIsModalOpen(false);
      setFormData({ name: '', account_number: '' });
      setError('');
      setSuccessMessage('Bénéficiaire ajouté avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de l\'ajout du bénéficiaire');
    }
  });

  // Mutation pour modifier un bénéficiaire
  const updateBeneficiaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BeneficiaryFormData }) =>
      api.updateBeneficiary(id, data.name, data.account_number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setIsEditModalOpen(false);
      setEditingBeneficiary(null);
      setFormData({ name: '', account_number: '' });
      setError('');
      setSuccessMessage('Bénéficiaire modifié avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de la modification du bénéficiaire');
    }
  });

  // Mutation pour supprimer un bénéficiaire
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: (id: number) => api.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setSuccessMessage('Bénéficiaire supprimé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setError(error.message || 'Erreur lors de la suppression du bénéficiaire');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du bénéficiaire est requis');
      return;
    }

    if (!formData.account_number.trim()) {
      setError('Le numéro de compte est requis');
      return;
    }

    addBeneficiaryMutation.mutate(formData);
  };

  const handleEditSubmit = () => {
    if (!editingBeneficiary) return;

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du bénéficiaire est requis');
      return;
    }

    if (!formData.account_number.trim()) {
      setError('Le numéro de compte est requis');
      return;
    }

    updateBeneficiaryMutation.mutate({
      id: editingBeneficiary.id,
      data: formData
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ name: '', account_number: '' });
    setError('');
  };

  const openEditModal = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      name: beneficiary.name,
      account_number: beneficiary.account_number
    });
    setIsEditModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setEditingBeneficiary(null);
    setFormData({ name: '', account_number: '' });
    setError('');
  };

  const handleDelete = (beneficiary: Beneficiary) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le bénéficiaire "${beneficiary.name}" ?`)) {
      deleteBeneficiaryMutation.mutate(beneficiary.id);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-secondary mb-2">
                Mes bénéficiaires
              </h1>
              <p className="text-neutral-500">
                Total des bénéficiaires : {beneficiaries.length}
              </p>
            </div>

            <button
              onClick={openModal}
              className="px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Ajouter un bénéficiaire
            </button>
          </div>

          {/* Messages de succès et d'erreur */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Liste des bénéficiaires */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-neutral-500">Chargement...</p>
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-card">
              <p className="text-neutral-500 text-lg mb-4">
                Vous n'avez pas encore de bénéficiaires
              </p>
              <button
                onClick={openModal}
                className="px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Ajouter votre premier bénéficiaire
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beneficiaries.map((beneficiary: Beneficiary) => (
                <div
                  key={beneficiary.id}
                  className="bg-white rounded-xl p-6 shadow-card hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    {beneficiary.name}
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    {beneficiary.account_number}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(beneficiary)}
                      className="flex-1 px-4 py-2 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(beneficiary)}
                      disabled={deleteBeneficiaryMutation.isPending}
                      className="flex-1 px-4 py-2 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteBeneficiaryMutation.isPending ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de bénéficiaire */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold text-secondary mb-6">
              Ajouter un bénéficiaire
            </h2>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nom du bénéficiaire"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="Numéro de compte (ex: FR76 1234 1234 1234)"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={addBeneficiaryMutation.isPending}
                  className="flex-1 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addBeneficiaryMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de bénéficiaire */}
      {isEditModalOpen && editingBeneficiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold text-secondary mb-6">
              Modifier le bénéficiaire
            </h2>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nom du bénéficiaire"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="Numéro de compte (ex: FR76 1234 1234 1234)"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>

                <button
                  onClick={handleEditSubmit}
                  disabled={updateBeneficiaryMutation.isPending}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateBeneficiaryMutation.isPending ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BeneficiariesPage;