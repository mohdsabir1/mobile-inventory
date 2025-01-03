import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMobileAlt, FaEdit, FaTrash } from 'react-icons/fa';

const ModelList = () => {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newModel, setNewModel] = useState({
    name: '',
    categoryId: '',
    description: ''
  });
  const [editingModel, setEditingModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/models'),
        axios.get('http://localhost:3000/api/categories')
      ]);
      setModels(modelsRes.data);
      setCategories(categoriesRes.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await axios.patch(`http://localhost:3000/api/models/${editingModel._id}`, newModel);
      } else {
        await axios.post('http://localhost:3000/api/models', newModel);
      }
      setNewModel({ name: '', categoryId: '', description: '' });
      setEditingModel(null);
      fetchData();
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setNewModel({
      name: model.name,
      categoryId: model.category._id,
      description: model.description
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`http://localhost:3000/api/models/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingModel ? 'Edit Model' : 'Add New Model'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newModel.categoryId}
              onChange={(e) => setNewModel({ ...newModel, categoryId: e.target.value })}
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
              Description
            </label>
            <textarea
              value={newModel.description}
              onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            {editingModel && (
              <button
                type="button"
                onClick={() => {
                  setEditingModel(null);
                  setNewModel({ name: '', categoryId: '', description: '' });
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
              {editingModel ? 'Update' : 'Add'} Model
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaMobileAlt className="text-blue-600" />
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-gray-500">{model.category?.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(model)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(model._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelList;
