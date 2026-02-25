const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const chartService = {
  /**
   * Fetch repair priority class data
   */
  getRepairPriorityClass: async () => {
    return fetch(`${API_BASE_URL}/charts/repair-priority-class`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
        'Accept': 'application/json',
      },
    }).then((res) => res.json());
  },

  /**
   * Fetch time to resolve data
   */
  getTimeToResolve: async () => {
    return fetch(`${API_BASE_URL}/charts/time-to-resolve`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
        'Accept': 'application/json',
      },
    }).then((res) => res.json());
  },

  /**
   * Fetch fuel costs data
   */
  getFuelCosts: async () => {
    return fetch(`${API_BASE_URL}/charts/fuel-costs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
        'Accept': 'application/json',
      },
    }).then((res) => res.json());
  },

  /**
   * Fetch service costs data
   */
  getServiceCosts: async () => {
    return fetch(`${API_BASE_URL}/charts/service-costs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
        'Accept': 'application/json',
      },
    }).then((res) => res.json());
  },
};
