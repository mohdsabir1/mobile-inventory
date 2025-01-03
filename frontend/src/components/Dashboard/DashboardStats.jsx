import React from 'react';
import { FaRupeeSign, FaBoxes, FaShoppingCart, FaChartLine } from 'react-icons/fa';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue?.toLocaleString() || 0}`,
      icon: <FaRupeeSign className="text-green-500" />,
      bgColor: 'bg-green-100'
    },
    {
      title: "Today's Sales",
      value: stats.todaySales || 0,
      icon: <FaShoppingCart className="text-blue-500" />,
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Inventory Value',
      value: `₹${stats.totalInventoryValue?.toLocaleString() || 0}`,
      icon: <FaBoxes className="text-purple-500" />,
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockParts?.length || 0,
      icon: <FaChartLine className="text-red-500" />,
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
