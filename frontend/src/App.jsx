import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import CategoryList from './components/Mobiles/MobileList';
import CategoryModels from './components/Models/CategoryModels';
import ModelParts from './components/Parts/ModelParts';
import SalesList from './components/Sales/SalesList';
import Settings from './components/Settings/Settings';
import { AuthProvider } from './context/AuthContext';
import { SalesProvider } from './context/SalesContext';
import { PartsProvider } from './context/PartsContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SalesProvider>
        <PartsProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <>
                        <Navbar />
                        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/mobiles" element={<CategoryList />} />
                            <Route path="/mobiles/:categoryId/models" element={<CategoryModels />} />
                            <Route path="/models/:modelId/parts" element={<ModelParts />} />
                            <Route path="/sales" element={<SalesList />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </main>
                      </>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </PartsProvider>
      </SalesProvider>
    </AuthProvider>
  );
}

export default App;
