import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const PartsContext = createContext();

export const PartsProvider = ({ children }) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPartsByModel = useCallback(async (modelId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/parts/model/${modelId}`);
            setParts(response.data);
        } catch (error) {
            console.error('Error fetching parts:', error);
            setError('Failed to load parts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addPart = useCallback(async (partData) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/parts`, partData);
            setParts(currentParts => [...currentParts, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error adding part:', error);
            setError('Failed to add part. Please try again.');
            throw error;
        }
    }, []);

    const updatePart = useCallback(async (partId, partData) => {
        try {
            setError(null);
            const response = await axios.patch(`${API_URL}/parts/${partId}`, partData);
            setParts(currentParts => 
                currentParts.map(p => p._id === partId ? response.data : p)
            );
            return response.data;
        } catch (error) {
            console.error('Error updating part:', error);
            setError('Failed to update part. Please try again.');
            throw error;
        }
    }, []);

    const deletePart = useCallback(async (partId) => {
        try {
            setError(null);
            await axios.delete(`${API_URL}/parts/${partId}`);
            setParts(currentParts => currentParts.filter(p => p._id !== partId));
        } catch (error) {
            console.error('Error deleting part:', error);
            setError('Failed to delete part. Please try again.');
            throw error;
        }
    }, []);

    return (
        <PartsContext.Provider value={{
            parts,
            loading,
            error,
            fetchPartsByModel,
            addPart,
            updatePart,
            deletePart
        }}>
            {children}
        </PartsContext.Provider>
    );
};

export const useParts = () => {
    const context = useContext(PartsContext);
    if (!context) {
        throw new Error('useParts must be used within a PartsProvider');
    }
    return context;
};
