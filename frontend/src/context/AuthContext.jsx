import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_USER = {
  username: 'Admin',
  password: '#iYf_y9l91F',
  role: 'admin',
  permissions: ['dashboard', 'sales.add', 'sales.edit', 'sales.delete', 'sales.view',
                'mobiles.add', 'mobiles.edit', 'mobiles.delete', 'mobiles.view',
                'models.add', 'models.edit', 'models.delete', 'models.view',
                'parts.add', 'parts.edit', 'parts.delete', 'parts.view',
                'settings.view', 'settings.edit']
};

const REGULAR_USER = {
  username: 'user',
  password: 'user@123',
  role: 'user',
  permissions: ['sales.add', 'sales.view', 'mobiles.view', 'models.view', 'parts.view']
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Check for admin
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const userData = { ...ADMIN_USER };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    // Check for regular user
    if (username === REGULAR_USER.username && password === REGULAR_USER.password) {
      const userData = { ...REGULAR_USER };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const canView = (module) => hasPermission(`${module}.view`);
  const canAdd = (module) => hasPermission(`${module}.add`);
  const canEdit = (module) => hasPermission(`${module}.edit`);
  const canDelete = (module) => hasPermission(`${module}.delete`);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      hasPermission,
      canView,
      canAdd,
      canEdit,
      canDelete,
      isAdmin: user?.role === 'admin',
      isUser: user?.role === 'user'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
