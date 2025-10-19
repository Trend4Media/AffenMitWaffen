import React, { useState, useEffect } from 'react';
import { Users, Shield, Check, X, Trash2, ChevronLeft } from 'lucide-react';
import api from './api/client';

function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.activateUser(userId, !currentStatus);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await api.setUserAdmin(userId, !currentStatus);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bist du sicher, dass du diesen User löschen möchtest?')) {
      return;
    }

    try {
      await api.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 text-purple-600" />
          <div className="text-xl text-gray-600">Lade User...</div>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.isActive);
  const activeUsers = users.filter(u => u.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
              Zurück
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield size={28} />
              Admin Panel
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Ausstehende Freigaben */}
        {pendingUsers.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
              <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
                <Users size={24} />
                Ausstehende Freigaben ({pendingUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registriert am</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600">{user.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Check size={18} />
                          Freischalten
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aktive User */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <Users size={24} />
              Aktive User ({activeUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Admin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Systeme</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.name || '-'}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user._count.systems}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors text-sm"
                          title="Deaktivieren"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors text-sm ${
                            user.isAdmin
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                          title={user.isAdmin ? 'Admin entfernen' : 'Zum Admin machen'}
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
