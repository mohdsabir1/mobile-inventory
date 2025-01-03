import React, { useState } from 'react';
import { FaCog, FaMobile, FaTools, FaChartBar, FaList } from 'react-icons/fa';
import PartTypeManagement from './PartTypeManagement';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    // { id: 'general', name: 'General Settings', icon: <FaCog /> },
    // { id: 'mobiles', name: 'Mobile Categories', icon: <FaMobile /> },
    // { id: 'parts', name: 'Parts Management', icon: <FaTools /> },
    { id: 'partTypes', name: 'Part Types', icon: <FaList /> },
    // { id: 'reports', name: 'Report Settings', icon: <FaChartBar /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'mobiles':
        return <MobileSettings />;
      case 'parts':
        return <PartsSettings />;
      case 'partTypes':
        return <PartTypeManagement />;
      case 'reports':
        return <ReportSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">General Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Stock Threshold
        </label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Enter default threshold"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency Format
        </label>
        <select className="w-full border rounded-lg px-3 py-2">
          <option>₹ (INR)</option>
          <option>$ (USD)</option>
        </select>
      </div>
    </div>
  </div>
);

const MobileSettings = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Mobile Categories</h2>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Add new category"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Add
        </button>
      </div>
      <div className="border rounded-lg divide-y">
        {['Samsung', 'Xiaomi', 'Apple'].map((category) => (
          <div
            key={category}
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span>{category}</span>
            <div className="space-x-2">
              <button className="text-blue-600 hover:text-blue-700">Edit</button>
              <button className="text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PartsSettings = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Parts Management</h2>
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Display Types</h3>
        <div className="space-y-2">
          {['AMOLED', 'Super AMOLED', 'IPS LCD'].map((type) => (
            <div key={type} className="flex items-center justify-between p-2 border rounded-lg">
              <span>{type}</span>
              <button className="text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-2">Charger Types</h3>
        <div className="space-y-2">
          {['Fast Charging', 'Super Fast Charging', 'Normal'].map((type) => (
            <div key={type} className="flex items-center justify-between p-2 border rounded-lg">
              <span>{type}</span>
              <button className="text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ReportSettings = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Report Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Report Period
        </label>
        <select className="w-full border rounded-lg px-3 py-2">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Custom</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Auto-generate Reports
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Daily Sales Report
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Low Stock Alerts
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Revenue Analysis
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default Settings;
