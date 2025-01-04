import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Modal from '../common/Modal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useAuth } from '../../context/AuthContext';

const CategoryModels = () => {
  const [models, setModels] = useState([]);
  const [category, setCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', description: '' });
  const [editingModel, setEditingModel] = useState(null);
  const [deletingModel, setDeletingModel] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', or 'delete'
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { canAdd, canEdit, canDelete } = useAuth();

  const canAddModels = canAdd('models');
  const canEditModels = canEdit('models');
  const canDeleteModels = canDelete('models');

  useEffect(() => {
    fetchCategory();
    fetchModels();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchModels = async () => {
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
      if (editingModel) {
        await axios.put(`${API_URL}/models/${editingModel._id}`, newModel);
      } else {
        await axios.post(`${API_URL}/models`, { 
          name: newModel.name,
          category: categoryId,
          description: newModel.description || ''
        });
      }
      setNewModel({ name: '', description: '' });
      setIsModalOpen(false);
      setEditingModel(null);
      fetchModels();
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/models/${id}`);
      setIsDeleteModalOpen(false);
      setDeletingModel(null);
      fetchModels();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const openDeleteModal = (model) => {
    setDeletingModel(model);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setEditingModel(null);
    setNewModel({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (model) => {
    setEditingModel(model);
    setNewModel({ name: model.name, description: model.description });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {category?.name} Models
          </h1>
        </div>
        {canAddModels && (
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add Model
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{model.name}</h2>
              <div className="flex space-x-2">
                {canEditModels && (
                  <button
                    onClick={() => openEditModal(model)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <FaEdit />
                  </button>
                )}
                {canDeleteModels && (
                  <button
                    onClick={() => openDeleteModal(model)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
            <Link
              to={`/models/${model._id}/parts`}
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              View Parts →
            </Link>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingModel ? 'Edit Model' : 'Add New Model'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                id="name"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Model Description
              </label>
              <textarea
                id="description"
                value={newModel.description}
                onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingModel ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(deletingModel?._id)}
        itemName={deletingModel?.name}
        itemType="model"
      />
    </div>
  );
};

export default CategoryModels;
