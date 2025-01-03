import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RecentSales from '../components/Dashboard/RecentSales';
import LowStockAlert from '../components/Dashboard/LowStockAlert';
import { API_URL } from '../config/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    todayRevenue: 0,
    totalInventoryValue: 0,
    recentSales: [],
    lowStockParts: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard`);
        setDashboardData(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <select className="border rounded-lg px-3 py-2">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Export Report
          </button>
        </div>
      </div>

      <DashboardStats stats={dashboardData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <RecentSales sales={dashboardData.recentSales} />
        </div>
        <div className="lg:col-span-2">
          <LowStockAlert lowStockParts={dashboardData.lowStockParts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
