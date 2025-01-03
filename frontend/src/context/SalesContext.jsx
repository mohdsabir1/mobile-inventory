import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/sales`);
      setSales(response.data.sales || []);  
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales. Please try again.');
      setSales([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (saleData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/sales`, saleData);
      setSales(currentSales => [response.data.sale, ...currentSales]); 
      return response.data.sale;
    } catch (error) {
      console.error('Error creating sale:', error);
      setError(error.response?.data?.message || 'Failed to create sale. Please try again.');
      throw error;
    }
  }, []);

  return (
    <SalesContext.Provider value={{
      sales,
      loading,
      error,
      fetchSales,
      createSale
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
