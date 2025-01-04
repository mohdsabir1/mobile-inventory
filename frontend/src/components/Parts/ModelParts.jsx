import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/api';
import Modal from '../common/Modal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useAuth } from '../../context/AuthContext';

const ModelParts = () => {
  const [parts, setParts] = useState([]);
  const [model, setModel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPart, setNewPart] = useState({ 
    name: '',
    type: '', 
    price: '', 
    quantity: '',
    category: ''
  });
  const [editingPart, setEditingPart] = useState(null);
  const [deletingPart, setDeletingPart] = useState(null);
  const [partTypes, setPartTypes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { canAdd, canEdit, canDelete } = useAuth();

  const canAddParts = canAdd('parts');
  const canEditParts = canEdit('parts');
  const canDeleteParts = canDelete('parts');

  useEffect(() => {
    fetchModel();
    fetchParts();
    fetchPartTypes();
  }, [modelId]);

  const fetchModel = async () => {
    try {
      const response = await axios.get(`${API_URL}/models/${modelId}`);
      setModel(response.data);
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await axios.get(`${API_URL}/parts/model/${modelId}`);
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const fetchPartTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/part-types`);
      setPartTypes(response.data);
    } catch (error) {
      console.error('Error fetching part types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const partData = {
        name: newPart.type, // Using type as name since they represent the same thing
        type: newPart.type,
        price: Number(newPart.price),
        quantity: Number(newPart.quantity),
        model: modelId,
        category: model.category._id // Get category from the current model
      };

      if (editingPart) {
        await axios.put(`${API_URL}/parts/${editingPart._id}`, partData);
      } else {
        await axios.post(`${API_URL}/parts`, partData);
      }
      setNewPart({ 
        name: '',
        type: '', 
        price: '', 
        quantity: '',
        category: ''
      });
      setSelectedCategory('');
      setIsModalOpen(false);
      setEditingPart(null);
      fetchParts();
    } catch (error) {
      console.error('Error saving part:', error);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setSelectedCategory(part.category?.name || '');
    setNewPart({
      name: part.name,
      type: part.type,
      price: part.price,
      quantity: part.quantity,
      category: part.category?._id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/parts/${id}`);
      setIsDeleteModalOpen(false);
      setDeletingPart(null);
      fetchParts();
    } catch (error) {
      console.error('Error deleting part:', error);
    }
  };

  const openDeleteModal = (part) => {
    setDeletingPart(part);
    setIsDeleteModalOpen(true);
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
            {model?.name} Parts
          </h1>
        </div>
        {canAddParts && (
          <button
            onClick={() => {
              setEditingPart(null);
              setNewPart({ 
                name: '',
                type: '', 
                price: '', 
                quantity: '',
                category: ''
              });
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add Part
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => (
          <div key={part._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{part.type}</h2>
              <div className="flex space-x-2">
                {canEditParts && (
                  <button
                    onClick={() => handleEdit(part)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <FaEdit />
                  </button>
                )}
                {canDeleteParts && (
                  <button
                    onClick={() => openDeleteModal(part)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Price: ₹{part.price}</p>
              <p className="text-gray-600">Quantity: {part.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPart ? 'Edit Part' : 'Add New Part'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setNewPart(prev => ({ ...prev, type: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(partTypes).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Type
                </label>
                <select
                  value={newPart.type}
                  onChange={(e) => setNewPart({ ...newPart, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!selectedCategory}
                >
                  <option value="">Select Part Type</option>
                  {selectedCategory && partTypes[selectedCategory]?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingPart ? 'Update' : 'Add'} Part
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(deletingPart?._id)}
        itemName={deletingPart?.type}
        itemType="part"
      />
    </div>
  );
};

export default ModelParts;
