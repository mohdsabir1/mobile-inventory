import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { API_URL } from '../../config/api';

const PartTypeManagement = () => {
  const [partTypes, setPartTypes] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingType, setEditingType] = useState({ category: '', oldType: '', newType: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartTypes();
  }, []);

  const fetchPartTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/part-types`);
      setPartTypes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching part types:', error);
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(`${API_URL}/part-types/category`, { name: newCategory });
      setNewCategory('');
      fetchPartTypes();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddType = async () => {
    if (!selectedCategory || !newType.trim()) return;
    try {
      await axios.post(`${API_URL}/part-types/${selectedCategory}`, { type: newType });
      setNewType('');
      fetchPartTypes();
    } catch (error) {
      console.error('Error adding type:', error);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(`${API_URL}/part-types/category/${category}`);
      fetchPartTypes();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeleteType = async (category, type) => {
    try {
      await axios.delete(`${API_URL}/part-types/${category}/${type}`);
      fetchPartTypes();
    } catch (error) {
      console.error('Error deleting type:', error);
    }
  };

  const handleEditType = async (category, oldType, newType) => {
    if (!newType.trim() || oldType === newType) {
      setEditingType({ category: '', oldType: '', newType: '' });
      return;
    }
    try {
      await axios.put(`${API_URL}/part-types/${category}/${oldType}`, { type: newType });
      setEditingType({ category: '', oldType: '', newType: '' });
      fetchPartTypes();
    } catch (error) {
      console.error('Error editing type:', error);
    }
  };

  const startEditingType = (category, type) => {
    setEditingType({ category, oldType: type, newType: type });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800">Part Type Management</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-indigo-100">
        <div className="flex flex-col gap-4">
          {/* Add Category */}
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Part Name"
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
              <button
                onClick={handleAddCategory}
                className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
              >
                <FaPlus /> Add
              </button>
            </div>
          </div>

          {/* Add Type */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              >
                <option value="">Select Part</option>
                {Object.keys(partTypes).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="New type"
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                />
                <button
                  onClick={handleAddType}
                  disabled={!selectedCategory}
                  className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                >
                  <FaPlus /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Types List */}
      <div className="bg-white rounded-lg shadow-lg border border-indigo-100">
        {Object.entries(partTypes).map(([category, types]) => (
          <div key={category} className="border-b last:border-b-0 border-indigo-100">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-indigo-800">{category}</span>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <div
                    key={type}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                      editingType.category === category && editingType.oldType === type
                        ? 'bg-indigo-100 ring-2 ring-indigo-300'
                        : 'bg-gray-100 hover:bg-indigo-50'
                    }`}
                  >
                    {editingType.category === category && editingType.oldType === type ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={editingType.newType}
                          onChange={(e) => setEditingType({ ...editingType, newType: e.target.value })}
                          className="border rounded px-2 py-1 text-sm w-32"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditType(category, type, editingType.newType)}
                          className="text-green-600 hover:text-green-800 p-1.5"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingType({ category: '', oldType: '', newType: '' })}
                          className="text-red-600 hover:text-red-800 p-1.5"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{type}</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setEditingType({ category, oldType: type, newType: type })}
                            className="text-indigo-600 hover:text-indigo-800 p-1.5"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteType(category, type)}
                            className="text-red-600 hover:text-red-800 p-1.5"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartTypeManagement;
