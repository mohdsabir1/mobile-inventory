import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTools, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const API_URL = 'http://localhost:3000/api';

const PartList = () => {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newPart, setNewPart] = useState({
    name: '',
    modelId: '',
    categoryId: '',
    type: '',
    specifications: {},
    price: '',
    quantity: '',
    threshold: ''
  });
  const [editingPart, setEditingPart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partTypes, setPartTypes] = useState({});

  useEffect(() => {
    fetchData();
    fetchPartTypes();
  }, []);

  const fetchPartTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/part-types`);
      setPartTypes(response.data);
    } catch (error) {
      console.error('Error fetching part types:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [partsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/parts`),
        axios.get(`${API_URL}/categories`)
      ]);
      setParts(partsRes.data);
      setCategories(categoriesRes.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchModels(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchModels = async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/models/category/${categoryId}`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await axios.patch(`${API_URL}/parts/${editingPart._id}`, newPart);
      } else {
        await axios.post(`${API_URL}/parts`, newPart);
      }
      setNewPart({
        name: '',
        modelId: '',
        categoryId: '',
        type: '',
        specifications: {},
        price: '',
        quantity: '',
        threshold: ''
      });
      setEditingPart(null);
      fetchData();
    } catch (error) {
      console.error('Error saving part:', error);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setSelectedCategory(part.category._id);
    setNewPart({
      name: part.name,
      modelId: part.model._id,
      categoryId: part.category._id,
      type: part.type,
      specifications: part.specifications,
      price: part.price,
      quantity: part.quantity,
      threshold: part.threshold
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await axios.delete(`${API_URL}/parts/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting part:', error);
      }
    }
  };

  const handleSpecificationChange = (key, value) => {
    setNewPart(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingPart ? 'Edit Part' : 'Add New Part'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setNewPart(prev => ({ ...prev, categoryId: e.target.value, modelId: '' }));
                }}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={newPart.modelId}
                onChange={(e) => setNewPart({ ...newPart, modelId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Name
              </label>
              <select
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Part Type</option>
                {Object.keys(partTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part Type
              </label>
              <select
                value={newPart.type}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  setNewPart(prev => ({
                    ...prev,
                    type: selectedType,
                    specifications: {} // Reset specifications when type changes
                  }));
                }}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Type</option>
                {Object.entries(partTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Specifications based on part type */}
          {newPart.name === 'Display' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={newPart.specifications.size || ''}
                  onChange={(e) => handleSpecificationChange('size', e.target.value)}
                  placeholder="e.g., 6.7 inch"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution
                </label>
                <input
                  type="text"
                  value={newPart.specifications.resolution || ''}
                  onChange={(e) => handleSpecificationChange('resolution', e.target.value)}
                  placeholder="e.g., 1080 x 2400"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {newPart.name === 'Charger' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Power
                </label>
                <input
                  type="text"
                  value={newPart.specifications.outputPower || ''}
                  onChange={(e) => handleSpecificationChange('outputPower', e.target.value)}
                  placeholder="e.g., 67W"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technology
                </label>
                <input
                  type="text"
                  value={newPart.specifications.technology || ''}
                  onChange={(e) => handleSpecificationChange('technology', e.target.value)}
                  placeholder="e.g., Smart Charging"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={newPart.price}
                onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold
              </label>
              <input
                type="number"
                value={newPart.threshold}
                onChange={(e) => setNewPart({ ...newPart, threshold: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingPart && (
              <button
                type="button"
                onClick={() => {
                  setEditingPart(null);
                  setNewPart({
                    name: '',
                    modelId: '',
                    categoryId: '',
                    type: '',
                    specifications: {},
                    price: '',
                    quantity: '',
                    threshold: ''
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {editingPart ? 'Update' : 'Add'} Part
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Parts Inventory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map((part) => (
                  <tr key={part._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaTools className="text-blue-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{part.name}</div>
                          <div className="text-sm text-gray-500">
                            {part.category?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.model?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{part.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          part.quantity <= part.threshold
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {part.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(part)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(part._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartList;
