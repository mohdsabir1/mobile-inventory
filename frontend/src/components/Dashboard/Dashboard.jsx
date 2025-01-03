import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaBoxOpen, FaMobileAlt, FaShoppingCart } from 'react-icons/fa';
import { API_URL } from '../../config/api';
import RecentSales from './RecentSales';
import Spinner from '../common/Spinner';

const Dashboard = () => {
  const [lowStockParts, setLowStockParts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalParts, setTotalParts] = useState(0);
  const [totalModels, setTotalModels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const STOCK_THRESHOLD = 5;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch parts data
      const partsResponse = await axios.get(`${API_URL}/parts`);
      const lowStock = partsResponse.data.filter(part => part.quantity <= STOCK_THRESHOLD);
      setLowStockParts(lowStock);
      setTotalParts(partsResponse.data.length);

      // Fetch recent sales
      const salesResponse = await axios.get(`${API_URL}/sales/recent`);
      console.log('Recent sales response:', salesResponse.data); // Debug log
      setRecentSales(salesResponse.data.sales || []);

      // Fetch total models
      const modelsResponse = await axios.get(`${API_URL}/models`);
      setTotalModels(modelsResponse.data.length);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaBoxOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Parts</h3>
              <p className="text-2xl font-bold text-blue-600">{totalParts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaMobileAlt className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Models</h3>
              <p className="text-2xl font-bold text-green-600">{totalModels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Recent Sales</h3>
              <p className="text-2xl font-bold text-purple-600">{recentSales.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-700">Low Stock Alert</h2>
          </div>
        </div>
        <div className="p-4">
          {lowStockParts.length === 0 ? (
            <p className="text-gray-500">No parts are currently low in stock.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockParts.map((part) => (
                    <tr key={part._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.model?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {part.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{part.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <RecentSales sales={recentSales} />
    </div>
  );
};

export default Dashboard;
