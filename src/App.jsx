import React, { useState, useEffect } from 'react';
import { Search, LogOut, ChevronLeft, UserPlus, Shield } from 'lucide-react';
import api from './api/client';
import AdminPanel from './AdminPanel';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [user, setUser] = useState(null);
  const [systems, setSystems] = useState({});
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const systemsPerPage = 20;

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      setIsLoggedIn(true);
      loadSystems();
    }
  }, []);

  const loadSystems = async () => {
    setLoading(true);
    setError('');
    try {
      const systemsData = await api.getSystems();
      
      if (systemsData.length === 0) {
        // Systeme initialisieren wenn leer
        await api.initializeSystems();
        const newSystemsData = await api.getSystems();
        convertSystemsToState(newSystemsData);
      } else {
        convertSystemsToState(systemsData);
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Token') || err.message.includes('Ungültig')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const convertSystemsToState = (systemsData) => {
    const systemsObj = {};
    systemsData.forEach(system => {
      const systemNum = system.systemId.split(':')[1];
      systemsObj[systemNum] = {
        id: system.systemId,
        recRes: system.recRes,
        lastUpdate: system.lastUpdate.split('T')[0],
        planets: system.planets.map(planet => ({
          id: planet.planetId,
          important: planet.important,
          notes: planet.notes
        }))
      };
    });
    
    // Fehlende Systeme hinzufügen
    for (let i = 111; i <= 999; i++) {
      if (!systemsObj[i]) {
        systemsObj[i] = {
          id: `555:${i}`,
          recRes: false,
          lastUpdate: new Date().toISOString().split('T')[0],
          planets: Array.from({ length: 9 }, (_, idx) => ({
            id: `555:${i}:${idx + 1}`,
            important: false,
            notes: ''
          }))
        };
      }
    }
    
    setSystems(systemsObj);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(loginEmail, loginPassword);
      setUser(data.user);
      setIsLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
      await loadSystems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(registerData.email, registerData.password, registerData.name);
      setRegisterData({ email: '', password: '', name: '' });
      setIsRegistering(false);
      setRegistrationSuccess(true);
      // Kein Auto-Login mehr, da Account freigeschaltet werden muss
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setUser(null);
    setSystems({});
    setSelectedSystem(null);
  };

  const updateSystem = async (systemNum, updates) => {
    try {
      const systemId = `555:${systemNum}`;
      await api.updateSystem(systemId, updates);
      
      // Lokalen State aktualisieren
      const updatedSystems = {
        ...systems,
        [systemNum]: {
          ...systems[systemNum],
          ...updates,
          lastUpdate: new Date().toISOString().split('T')[0]
        }
      };
      setSystems(updatedSystems);
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePlanet = async (systemNum, planetIdx, updates) => {
    try {
      const systemId = `555:${systemNum}`;
      const planetId = `555:${systemNum}:${planetIdx + 1}`;
      await api.updatePlanet(systemId, planetId, updates);
      
      // Lokalen State aktualisieren
      const updatedSystems = {
        ...systems,
        [systemNum]: {
          ...systems[systemNum],
          planets: systems[systemNum].planets.map((planet, idx) =>
            idx === planetIdx ? { ...planet, ...updates } : planet
          ),
          lastUpdate: new Date().toISOString().split('T')[0]
        }
      };
      setSystems(updatedSystems);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredSystems = Object.values(systems).filter(system =>
    system.id.includes(searchTerm)
  );

  const indexOfLastSystem = currentPage * systemsPerPage;
  const indexOfFirstSystem = indexOfLastSystem - systemsPerPage;
  const currentSystems = filteredSystems.slice(indexOfFirstSystem, indexOfLastSystem);
  const totalPages = Math.ceil(filteredSystems.length / systemsPerPage);

  if (showAdminPanel && user?.isAdmin) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🪐 Galaxy 555</h1>
            <h2 className="text-xl text-gray-600">System Tracker</h2>
          </div>

          {registrationSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded">
              <p className="font-bold">✅ Registrierung erfolgreich!</p>
              <p className="text-sm mt-1">Dein Account muss noch von einem Administrator freigeschaltet werden. Du erhältst eine Benachrichtigung, sobald du dich einloggen kannst.</p>
              <button
                onClick={() => setRegistrationSuccess(false)}
                className="mt-2 text-sm underline"
              >
                Verstanden
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@beispiel.de"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Passwort eingeben"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Laden...' : 'Anmelden'}
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <UserPlus size={20} />
                Registrieren
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Dein Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@beispiel.de"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Passwort wählen"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Laden...' : 'Account erstellen'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Zurück zum Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading && Object.keys(systems).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🪐</div>
          <div className="text-xl text-gray-600">Lade Systeme...</div>
        </div>
      </div>
    );
  }

  if (selectedSystem) {
    const systemData = systems[selectedSystem];
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSystem(null)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
                Zurück
              </button>
              <h1 className="text-2xl font-bold">System {systemData.id}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto mt-6 px-6">
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">System-Status</h2>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={systemData.recRes}
                  onChange={(e) => updateSystem(selectedSystem, { recRes: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-medium">RecRes aktiv</span>
              </label>
              <div className="text-sm text-gray-600">
                Letztes Update: {systemData.lastUpdate || 'Noch nicht bearbeitet'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Planeten (9 Stück)</h2>
            <div className="space-y-4">
              {systemData.planets.map((planet, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <label className="flex items-center gap-2 min-w-fit">
                      <input
                        type="checkbox"
                        checked={planet.important}
                        onChange={(e) => updatePlanet(selectedSystem, idx, { important: e.target.checked, notes: planet.notes })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="font-medium">{planet.id}</span>
                      {planet.important && <span className="text-yellow-500">⭐</span>}
                    </label>
                    <input
                      type="text"
                      value={planet.notes}
                      onChange={(e) => updatePlanet(selectedSystem, idx, { important: planet.important, notes: e.target.value })}
                      placeholder="Notizen / Link..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🪐 Galaxy 555 System Tracker</h1>
            {user && <p className="text-sm opacity-90">Hallo, {user.name || user.email}!</p>}
          </div>
          <div className="flex items-center gap-2">
            {user?.isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Shield size={20} />
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mt-6 px-6">
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="System suchen (z.B. 555:342)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredSystems.filter(s => s.recRes).length} von {filteredSystems.length} Systemen mit RecRes
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">System-ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">RecRes Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Letztes Update</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSystems.map((system) => (
                <tr
                  key={system.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    system.recRes ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{system.id}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        system.recRes
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {system.recRes ? 'Ja' : 'Nein'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{system.lastUpdate || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedSystem(system.id.split(':')[1])}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <span className="px-4 py-2 text-gray-700">
              Seite {currentPage} von {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
