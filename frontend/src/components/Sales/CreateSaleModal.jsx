import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import { API_URL } from '../../config/api';
import { useSales } from '../../context/SalesContext';

const CreateSaleModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createSale } = useSales();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset selections when modal opens
      setSelectedCategory('');
      setSelectedModel('');
      setSelectedParts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory) {
      fetchModels(selectedCategory);
      setSelectedModel('');
      setSelectedParts([]);
    } else {
      setModels([]);
      setSelectedModel('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedModel) {
      fetchParts(selectedModel);
      setSelectedParts([]);
    } else {
      setParts([]);
      setSelectedParts([]);
    }
  }, [selectedModel]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (categoryId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/models/category/${categoryId}`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async (modelId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/parts/model/${modelId}`);
      // Group parts by name
      const groupedParts = response.data.reduce((acc, part) => {
        if (!acc[part.name]) {
          acc[part.name] = [];
        }
        acc[part.name].push(part);
        return acc;
      }, {});
      setParts(groupedParts);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (part, quantity) => {
    if (quantity > 0) {
      setSelectedParts(prev => {
        const existing = prev.find(p => p.part._id === part._id);
        if (existing) {
          return prev.map(p =>
            p.part._id === part._id
              ? { ...p, quantity: parseInt(quantity) }
              : p
          );
        }
        return [...prev, { part, quantity: parseInt(quantity) }];
      });
    } else {
      setSelectedParts(prev => prev.filter(p => p.part._id !== part._id));
    }
  };

  const handleRemovePart = (partId) => {
    setSelectedParts(prev => prev.filter(p => p.part._id !== partId));
  };

  const calculateTotal = () => {
    return selectedParts.reduce((total, { part, quantity }) => {
      return total + (part.price * quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }

    if (selectedParts.length === 0) {
      alert('Please select at least one part');
      return;
    }

    try {
      setLoading(true);
      const saleData = {
        model: selectedModel,
        items: selectedParts.map(({ part, quantity }) => ({
          part: part._id,
          quantity: parseInt(quantity)
        }))
      };

      console.log('Creating sale with data:', saleData);
      await createSale(saleData);
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error.response?.data?.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Sale</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
              disabled={!selectedCategory}
            >
              <option value="">Select Model</option>
              {models.map((model) => (
                <option key={model._id} value={model._id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Parts Summary */}
          {selectedParts.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-2">Selected Parts</h4>
              <ul className="space-y-2">
                {selectedParts.map(({ part, quantity }) => (
                  <li key={part._id} className="flex justify-between items-center">
                    <span>
                      {part.name} ({part.type}) - {quantity} units × ₹{part.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePart(part._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <strong>Total: ₹{calculateTotal()}</strong>
              </div>
            </div>
          )}

          {/* Parts Selection */}
          {selectedModel && (
            <div className="space-y-4">
              <h4 className="font-medium">Available Parts</h4>
              {Object.entries(parts).map(([partName, partVariants]) => (
                <div key={partName} className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2">{partName}</h5>
                  <div className="space-y-2">
                    {partVariants.map((part) => {
                      const selectedPart = selectedParts.find(p => p.part._id === part._id);
                      return (
                        <div key={part._id} className="flex items-center space-x-4 bg-gray-50 p-2 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{part.type}</div>
                            <div className="text-sm text-gray-600">
                              Price: ₹{part.price} | Stock: {part.quantity}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={part.quantity}
                            className="w-24 border rounded px-2 py-1"
                            onChange={(e) => handlePartSelect(part, e.target.value)}
                            value={selectedPart?.quantity || ''}
                            placeholder="Qty"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || selectedParts.length === 0 || !selectedModel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                'Create Sale'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSaleModal;
