const API_BASE_URL = 'http://localhost:8000';

export interface Account {
  id: number;
  account_number: string;
  balance: number;
  is_main: boolean;
  is_closed: boolean;
  created_at: string;
}

export interface Beneficiary {
  id: number;
  name: string;
  account_number: string;
  user_id: number;
  added_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  source_account_id: number | null;
  destination_account_id: number | null;
  created_at: string;
  is_cancelled: boolean;
  is_confirmed: boolean;
  description: string;
}

export interface TransferResponse {
  message: string;
  source_account: {
    id: number;
    account_number: string;
    balance: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  destination_account: {
    id: number;
    account_number: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  transaction: Transaction;
}

export interface DashboardAccount {
  id: number;
  account_number: string;
  balance: number;
  is_main: boolean;
}

export interface DashboardTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  source_account_id: number | null;
  destination_account_id: number | null;
  created_at: string;
  is_cancelled: boolean;
  is_confirmed: boolean;
  description: string;
  is_income: boolean;
  is_expense: boolean;
  is_internal: boolean;
}

export interface DashboardStats {
  total_balance: number;
  accounts: DashboardAccount[];
  transactions: DashboardTransaction[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // Récupérer les comptes de l'utilisateur
  async getUserAccounts(userId: number): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/accounts/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des comptes');
    }
    return response.json();
  },

  // Récupérer les infos d'un compte spécifique
  async getAccountInfo(accountId: number): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du compte');
    }
    return response.json();
  },

  // Clôturer un compte avec mot de passe
  async closeAccount(accountId: number, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/close/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erreur lors de la clôture du compte');
    }

    return data;
  },

  // Modifier un bénéficiaire
  async updateBeneficiary(beneficiaryId: number, name: string, accountNumber: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/beneficiaries/${beneficiaryId}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        account_number: accountNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erreur lors de la modification du bénéficiaire');
    }

    return data;
  },

  // Supprimer un bénéficiaire
  async deleteBeneficiary(beneficiaryId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/beneficiaries/${beneficiaryId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Erreur lors de la suppression du bénéficiaire');
    }

    return { message: 'Bénéficiaire supprimé avec succès' };
  },

  // Créer un nouveau compte
  async createAccount(accountName?: string, accountType?: string): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        account_name: accountName || '',
        account_type: accountType || 'Compte courant',
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Erreur lors de la création du compte');
    }

    return response.json();
  },

  // Récupérer les statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques du dashboard');
    }

    return response.json();
  },

  // Récupérer l'utilisateur connecté
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l’utilisateur');
    }

    return response.json();
  },

  // Récupérer les bénéficiaires
  async getBeneficiaries(): Promise<Beneficiary[]> {
    const response = await fetch(`${API_BASE_URL}/user_beneficiaries/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des bénéficiaires');
    }
    return response.json();
  },

  // Ajouter un bénéficiaire
  async addBeneficiary(name: string, accountNumber: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/beneficiaries/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        account_number: accountNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de l'ajout du bénéficiaire");
    }

    return data;
  },

  // Effectuer un virement
  async transferMoney(
    sourceAccountId: number,
    destinationAccountNumber: string,
    amount: number,
    description?: string
  ): Promise<TransferResponse> {
    const response = await fetch(
      `${API_BASE_URL}/accounts/${sourceAccountId}/transfer/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          destination_account_number: destinationAccountNumber,
          amount,
          description: description || '',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erreur lors du virement');
    }

    return data;
  },

  // Annuler une transaction
  async cancelTransaction(transactionId: number): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/transactions/${transactionId}/cancel/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de l'annulation");
    }

    return data;
  },

  // Modifier le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/me/password/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erreur lors de la modification du mot de passe');
    }

    return data;
  },

  // Modifier l'email
  async changeEmail(newEmail: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/me/email/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        new_email: newEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de la modification de l'email");
    }

    return data;
  },
};