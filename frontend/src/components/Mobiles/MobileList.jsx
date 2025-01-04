import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMobile, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Modal from '../common/Modal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useAuth } from '../../context/AuthContext';

const MobileList = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const { canAdd, canEdit, canDelete } = useAuth();

  const canAddMobiles = canAdd('mobiles');
  const canEditMobiles = canEdit('mobiles');
  const canDeleteMobiles = canDelete('mobiles');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory._id}`, newCategory);
      } else {
        await axios.post(`${API_URL}/categories`, newCategory);
      }
      setNewCategory({ name: '' });
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mobile Categories</h1>
        {canAddMobiles && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaMobile className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">{category.name}</h2>
              </div>
              <div className="flex space-x-2">
                {canEditMobiles && (
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <FaEdit />
                  </button>
                )}
                {canDeleteMobiles && (
                  <button
                    onClick={() => openDeleteModal(category)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
            <Link
              to={`/mobiles/${category._id}/models`}
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              View Models →
            </Link>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(deletingCategory?._id)}
        itemName={deletingCategory?.name}
        itemType="category"
      />
    </div>
  );
};

export default MobileList;
