import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Select from 'react-select';
import { FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

const AddSale = ({ onSaleAdded }) => {
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedItems, setSelectedItems] = useState([{ part: null, quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error fetching categories');
    }
  };

  const fetchModels = async (categoryId) => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/models/category/${categoryId}`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Error fetching models');
    }
  };

  const fetchParts = async (modelId) => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/parts/model/${modelId}`);
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      setError('Error fetching parts');
    }
  };

  const handleCategoryChange = (option) => {
    setSelectedCategory(option);
    setSelectedModel(null);
    setSelectedItems([{ part: null, quantity: 1 }]);
    setParts([]);
    if (option) {
      fetchModels(option.value);
    } else {
      setModels([]);
    }
  };

  const handleModelChange = (option) => {
    setSelectedModel(option);
    setSelectedItems([{ part: null, quantity: 1 }]);
    if (option) {
      fetchParts(option.value);
    } else {
      setParts([]);
    }
  };

  const handlePartChange = (option, index) => {
    const newItems = [...selectedItems];
    newItems[index].part = option;
    setSelectedItems(newItems);
  };

  const handleQuantityChange = (value, index) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = parseInt(value) || 0;
    setSelectedItems(newItems);
  };

  const addItemRow = () => {
    setSelectedItems([...selectedItems, { part: null, quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!selectedModel) {
      throw new Error('Please select a model');
    }

    if (!selectedItems.length) {
      throw new Error('Please add at least one item');
    }

    for (const item of selectedItems) {
      if (!item.part) {
        throw new Error('Please select a part for each item');
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error('Quantity must be at least 1 for each item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      validateForm();

      const items = selectedItems.map(item => {
        const part = parts.find(p => p._id === item.part.value);
        if (!part) {
          throw new Error('Selected part not found');
        }
        return {
          part: item.part.value,
          quantity: item.quantity,
          pricePerUnit: Number(part.price)
        };
      });

      console.log('Submitting sale:', {
        model: selectedModel.value,
        items
      });

      const response = await axios.post(`${API_URL}/sales`, {
        model: selectedModel.value,
        items
      });

      console.log('Sale created:', response.data);

      // Reset form
      setSelectedCategory(null);
      setSelectedModel(null);
      setSelectedItems([{ part: null, quantity: 1 }]);
      setModels([]);
      setParts([]);

      // Notify parent
      if (onSaleAdded) {
        onSaleAdded(response.data);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      setError(error.response?.data?.message || error.message || 'Error creating sale');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.name
  }));

  const modelOptions = models.map(model => ({
    value: model._id,
    label: model.name
  }));

  const getPartOptions = () => {
    return parts.map(part => ({
      value: part._id,
      label: `${part.type} - ₹${part.price} (Stock: ${part.quantity})`
    }));
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Sale</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile
          </label>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categoryOptions}
            isClearable
            placeholder="Select Mobile"
            className="basic-select"
            classNamePrefix="select"
            isDisabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <Select
            value={selectedModel}
            onChange={handleModelChange}
            options={modelOptions}
            isDisabled={!selectedCategory || loading}
            isClearable
            placeholder="Select Model"
            className="basic-select"
            classNamePrefix="select"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Parts</label>
          {selectedItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-grow">
                <Select
                  value={item.part}
                  onChange={(option) => handlePartChange(option, index)}
                  options={getPartOptions()}
                  isDisabled={!selectedModel || loading}
                  placeholder="Select Part"
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
              <div className="w-24">
                <input
                  type="text"
                  // min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value, index)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItemRow(index)}
                disabled={selectedItems.length === 1 || loading}
                className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItemRow}
            disabled={loading}
            className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FaPlus className="mr-1" /> Add Another Part
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating Sale...
              </>
            ) : (
              'Create Sale'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSale;
