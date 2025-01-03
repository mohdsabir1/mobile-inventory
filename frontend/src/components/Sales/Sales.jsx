import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import AddSale from './AddSale';
import { formatCurrency } from '../../utils/format';
import Select from 'react-select';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddSale, setShowAddSale] = useState(false);
  const [activeFilter, setActiveFilter] = useState({ value: 'all', label: 'All Time' });

  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  const fetchSales = async (filter = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/sales${filter !== 'all' ? `?filter=${filter}` : ''}`);
      setSales(response.data.sales || []);
      setSummary(response.data.summary || {
        totalSales: 0,
        totalAmount: 0,
        totalItems: 0
      });
    } catch (error) {
      setError('Error fetching sales');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(activeFilter.value);
  }, [activeFilter]);

  const handleSaleAdded = (newSale) => {
    setShowAddSale(false);
    fetchSales(activeFilter.value);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
        <button
          onClick={() => setShowAddSale(!showAddSale)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showAddSale ? 'Cancel' : 'Add Sale'}
        </button>
      </div>

      {showAddSale && (
        <div className="mb-6">
          <AddSale onSaleAdded={handleSaleAdded} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalSales}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalItems}</p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="p-4 border-b">
          <div className="w-64">
            <Select
              value={activeFilter}
              onChange={setActiveFilter}
              options={filterOptions}
              className="basic-select"
              classNamePrefix="select"
              isSearchable={false}
            />
          </div>
        </div>

        {/* Sales Table */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sales found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.model?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {sale.items?.map((item, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {item.part?.type || 'N/A'} x {item.quantity} @ {formatCurrency(item.pricePerUnit)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
