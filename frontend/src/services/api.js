const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get the auth token from localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data,
      message: data.message,
      error: data.error
    });

    if (response.status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Authentication failed. Please log in again.');
    }

    // Include more error details in the thrown error
    throw new Error(data.message || data.error || `Server error: ${response.status} - ${response.statusText}`);
  }
  return data;
};

export const sleepApi = {
  // Get all sleep entries
  getEntries: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/sleep`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getEntries error:', error);
      throw error;
    }
  },

  // Add a new sleep entry
  addEntry: async (data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Saving sleep entry with token:', token);
      console.log('Data being sent:', JSON.stringify(data, null, 2));
      
      const response = await fetch(`${API_URL}/sleep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(data)
      });

      // Clone the response before reading it
      const responseToLog = response.clone();

      if (!response.ok) {
        const errorData = await responseToLog.json().catch(() => ({}));
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      return handleResponse(response);
    } catch (error) {
      console.error('addEntry error:', {
        message: error.message,
        stack: error.stack,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update a sleep entry
  updateEntry: async (id, data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/sleep/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateEntry error:', error);
      throw error;
    }
  },

  // Delete a sleep entry
  deleteEntry: async (id) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/sleep/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('deleteEntry error:', error);
      throw error;
    }
  }
}; 