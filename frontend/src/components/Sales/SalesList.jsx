import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSpinner, FaRupeeSign, FaFileDownload, FaFilter } from 'react-icons/fa';
import { API_URL } from '../../config/api';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import AddSale from './AddSale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import FileSaver from 'file-saver';

const SalesList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sales, loading, error, fetchSales } = useSales();
  const { canView, canAdd } = useAuth();
  const canViewSales = canView('sales');
  const canAddSales = canAdd('sales');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    filterSales();
  }, [sales, dateFilter]);

  const filterSales = () => {
    if (!sales) return;
    
    const now = new Date();
    let filtered = [...sales];

    switch (dateFilter) {
      case 'daily':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.toDateString() === now.toDateString();
        });
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekAgo;
        });
        break;
      case 'monthly':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      default:
        filtered = sales;
    }

    setFilteredSales(filtered);
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

  const getFormattedDateTime = () => {
    const now = new Date();
    return now.toISOString().split('T')[0] + '_' + 
           now.toTimeString().split(' ')[0].replace(/:/g, '-');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Model", "Parts", "Total Amount"];
    const tableRows = filteredSales.map(sale => [
      formatDate(sale.createdAt),
      sale.model?.name || 'N/A',
      sale.items.map(item => `${item.part?.type} x ${item.quantity} ${item.pricePerUnit}`).join(', '),
      `${sale.totalAmount?.toLocaleString()}`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 2: { cellWidth: 'auto' } }
    });

    doc.save(`sales-report_${getFormattedDateTime()}.pdf`);
  };

  const exportToCSV = () => {
    const csvData = filteredSales.map(sale => ({
      Date: formatDate(sale.createdAt),
      Model: sale.model?.name || 'N/A',
      Parts: sale.items.map(item => `${item.part?.type} x ${item.quantity} ${item.pricePerUnit}`).join('; '),
      'Total Amount': `${sale.totalAmount?.toLocaleString()}`
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, `sales-report_${getFormattedDateTime()}.csv`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
        {canAddSales && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <FaPlus className="mr-2" />
            Add Sale
          </button>
        )}
      </div>

      {canViewSales && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
              >
                <FaFileDownload className="mr-2" />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors"
              >
                <FaFileDownload className="mr-2" />
                PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      Parts
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales && filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.model?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {sale.items.map((item, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {item.part?.type} x {item.quantity} @ ₹{item.pricePerUnit}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 flex items-center justify-end">
                            <FaRupeeSign className="mr-1" />
                            {sale.totalAmount?.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No sales found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddSale
              onSaleAdded={(newSale) => {
                fetchSales();
                setIsModalOpen(false);
              }}
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesList;
