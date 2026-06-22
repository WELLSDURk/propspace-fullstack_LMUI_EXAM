import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FilterSidebar from './components/FilterSidebar';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';
import UserProfile from './components/UserProfile';
import { Property, FilterParams } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  MapPin, 
  X, 
  CheckCircle, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  Plus, 
  Home as HomeIcon,
  HelpCircle,
  Inbox
} from 'lucide-react';

// Main App Inner Component containing core state and view logic
function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    login, 
    register, 
    fetchWithAuth,
    error: authError,
    setError: setAuthError
  } = useAuth();

  // Active Main Panel View Tab: 'explore' | 'my-listings' | 'profile' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState<string>('explore');
  
  // Properties lists state
  const [properties, setProperties] = useState<Property[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  
  // Sidebar Search states
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'All',
  });

  // Modal forms management states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Authentication forms local states
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Fetch properties function
  const loadProperties = async (currentFilters: FilterParams) => {
    setIsLoadingProperties(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.city) params.append('city', currentFilters.city);
      if (currentFilters.propertyType && currentFilters.propertyType !== 'All') {
        params.append('propertyType', currentFilters.propertyType);
      }
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public listing directory.');
      }
      const data = await response.json();
      setProperties(data);
    } catch (err: any) {
      showToast(err.message || 'Error reading property feeds.', 'error');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // 2. Fetch authenticated user's own listings
  const loadMyProperties = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await fetchWithAuth('/api/properties/my-listings');
      setMyProperties(data);
    } catch (err: any) {
      showToast(err.message || 'Error pulling private listings.', 'error');
    }
  };

  // Refresh properties whenever filters change
  useEffect(() => {
    loadProperties(filters);
  }, [filters]);

  // Load private properties when entering 'my-listings' or when user gains authentication
  useEffect(() => {
    if (activeTab === 'my-listings') {
      loadMyProperties();
    }
  }, [activeTab, isAuthenticated]);

  // Derive all available cities directly from original list of properties for Filter Dropdowns
  const availableCities = useMemo(() => {
    const list = properties.map(p => p.city.trim());
    const unique = list.filter((val, idx, arr) => val && arr.indexOf(val) === idx);
    return unique.sort();
  }, [properties]);

  // Route Guard implementation: protect dashboard paths
  useEffect(() => {
    if ((activeTab === 'my-listings' || activeTab === 'profile') && !isAuthenticated && !isAuthLoading) {
      showToast('Please sign in to access your dashboard settings.', 'error');
      setActiveTab('login');
    }
  }, [activeTab, isAuthenticated, isAuthLoading]);

  // 3. Authenticate controls (Login submit)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Email and password required.');
      return;
    }
    setAuthLoading(true);
    const success = await login(authEmail, authPassword);
    setAuthLoading(false);
    if (success) {
      showToast('Glad to see you again! Logged in successfully.', 'success');
      setAuthEmail('');
      setAuthPassword('');
      setActiveTab('explore');
    }
  };

  // 4. Register submit controls
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername || !authEmail || !authPassword) {
      setAuthError('All details are required.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setAuthLoading(true);
    const success = await register(authUsername.trim(), authEmail.trim(), authPassword);
    setAuthLoading(false);
    if (success) {
      showToast(`Welcome to PropSpace, ${authUsername}! Your account was set up,`, 'success');
      setAuthEmail('');
      setAuthUsername('');
      setAuthPassword('');
      setActiveTab('explore');
    }
  };

  // 5. Create or Edit Listing Form Submit
  const handleFormSubmit = async (formData: any): Promise<boolean> => {
    try {
      if (editingProperty) {
        // Edit mode API path PUT
        const responseJson = await fetchWithAuth(`/api/properties/${editingProperty.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('Property listing updated successfully!', 'success');
      } else {
        // Create mode API path POST
        const responseJson = await fetchWithAuth('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('Listed! Your property is live on the public feed.', 'success');
      }
      
      // Refresh listing datasets
      loadProperties(filters);
      loadMyProperties();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to save listing details.', 'error');
      return false;
    }
  };

  // Trigger Edit modal popup
  const handleTriggerEdit = (property: Property) => {
    setEditingProperty(property);
    setFormOpen(true);
  };

  // Handle Delete listing popup
  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this property listing from PropSpace permanently?')) {
      return;
    }
    try {
      await fetchWithAuth(`/api/properties/${id}`, { method: 'DELETE' });
      showToast('Listing removed permanently.', 'success');
      loadProperties(filters);
      loadMyProperties();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" id="propspace-root">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-150 max-w-sm w-full pointer-events-auto"
            id="propspace-toast"
          >
            <div className={`p-4 rounded-xl border shadow-lg flex items-start space-x-3 backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-250' 
                : 'bg-red-50 text-red-900 border-red-250'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">
                  {toast.type === 'success' ? 'Task Succeeded' : 'Notice Prompt'}
                </p>
                <p className="text-xs text-opacity-90 mt-1 leading-normal">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NavbarComponent */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAddModal={() => {
          setEditingProperty(null);
          setFormOpen(true);
        }}
      />

      {/* Primary body grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <AnimatePresence mode="wait">
          
          {/* TAP A: Public Listings Directory */}
          {activeTab === 'explore' && (
            <motion.div
              key="explore-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
              id="view-explore"
            >
              {/* Sidebar filter column (1 Col on Large desktop) */}
              <div className="lg:col-span-1">
                <FilterSidebar 
                  filters={filters} 
                  onChangeFilters={setFilters} 
                  availableCities={availableCities}
                />
              </div>

              {/* Bento Grid listings column (3 Col on Large desktop) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Intro Hero Header */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs border border-indigo-950">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Building2 className="h-64 w-64" />
                  </div>
                  <div className="max-w-md space-y-2 relative z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Real-time Property Exchange
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Find or List Premium Real Estate Deals
                    </h1>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Settle, rent, or purchase apartments, houses, and studios across premium locations. Contact listing owners directly with zero external commission.
                    </p>
                  </div>
                </div>

                {/* State: Loading listings */}
                {isLoadingProperties ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-3" id="explore-loader">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-xs text-gray-400 font-medium">Querying property databases...</p>
                  </div>
                ) : properties.length === 0 ? (
                  /* State: Empty listings results */
                  <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl p-8" id="explore-empty">
                    <div className="p-4 bg-gray-50 text-gray-400 rounded-full inline-flex mx-auto mb-4">
                      <Inbox className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-950">No properties matched your criteria</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Try resetting active sliders, typing different cities, or adjusting your pricing specifications to broaden your search scope.
                    </p>
                    <button
                      onClick={() => setFilters({
                        search: '',
                        city: '',
                        minPrice: '',
                        maxPrice: '',
                        propertyType: 'All'
                      })}
                      className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  /* Standard bento grid listings */
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="explore-listings-grid">
                    {properties.map(prop => (
                      <PropertyCard 
                        key={prop.id} 
                        property={prop} 
                        onEdit={handleTriggerEdit} 
                        onDelete={handleDeleteListing}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB B: My Listings Dash board panel */}
          {activeTab === 'my-listings' && isAuthenticated && (
            <motion.div
              key="my-listings-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
              id="view-my-listings"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900">My Listings Dashboard</h2>
                  <p className="text-xs text-gray-550 mt-1">
                    Review and modify advertisements you currently have active on PropSpace.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  List a Property
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl p-8" id="my-listings-empty">
                  <div className="p-4 bg-gray-50 text-gray-400 rounded-full inline-flex mx-auto mb-4">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">No Listings Found</h3>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    You have not published any real estate listing advertisements under your profile credentials yet. Start now and connect with renters!
                  </p>
                  <button
                    onClick={() => {
                      setEditingProperty(null);
                      setFormOpen(true);
                    }}
                    className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-250 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Publish First Ad
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="my-listings-grid">
                  {myProperties.map(prop => (
                    <PropertyCard 
                      key={prop.id} 
                      property={prop} 
                      onEdit={handleTriggerEdit} 
                      onDelete={handleDeleteListing}
                      isDashboardView={true}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB C: Profile Management Panel */}
          {activeTab === 'profile' && isAuthenticated && (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              id="view-profile"
            >
              <UserProfile />
            </motion.div>
          )}

          {/* TAB D: Login Screen Form */}
          {activeTab === 'login' && !isAuthenticated && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-md mx-auto py-12"
              id="view-login"
            >
              <div className="bg-white rounded-2xl border border-gray-150 p-8 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-indigo-600 mr-2" />
                    Welcome Back Partner
                  </h2>
                  <p className="text-xs text-gray-500">
                    Sign in with email and access listing privileges and profile settings.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                  {authError && (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 font-medium">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Account Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="e.g. support@propspace.com"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800"
                      id="login-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-700">Verification Password</label>
                    </div>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800"
                      id="login-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all flex justify-center items-center cursor-pointer"
                    id="btn-login-submit"
                  >
                    {authLoading ? 'Signing In...' : 'Verify & Enter Dashboard'}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-550">
                    Do not have a workspace partner account?{' '}
                    <button
                      onClick={() => {
                        setAuthError(null);
                        setActiveTab('register');
                      }}
                      className="text-indigo-650 hover:underline font-bold"
                    >
                      Sign Up Now
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB E: Register Screen Form */}
          {activeTab === 'register' && !isAuthenticated && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-md mx-auto py-12"
              id="view-register"
            >
              <div className="bg-white rounded-2xl border border-gray-150 p-8 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-indigo-600 mr-2" />
                    Register PropSpace Partner
                  </h2>
                  <p className="text-xs text-gray-500">
                    Join premium listing dealers and reach thousands of daily renters inside a week.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
                  {authError && (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 font-medium font-bold">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Display Username (Unique)</label>
                    <input
                      type="text"
                      required
                      value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)}
                      placeholder="e.g. realtorgroup"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800"
                      id="register-username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email Address (Unique)</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="e.g. verify@realtorgroup.com"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800"
                      id="register-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Password (Min 6 characters)</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-800"
                      id="register-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all flex justify-center items-center cursor-pointer"
                    id="btn-register-submit"
                  >
                    {authLoading ? 'Setting Up Account...' : 'Complete Registration'}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-550">
                    Already registered with PropSpace?{' '}
                    <button
                      onClick={() => {
                        setAuthError(null);
                        setActiveTab('login');
                      }}
                      className="text-indigo-650 hover:underline font-bold"
                    >
                      Sign In Instantly
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Footer Block */}
      <footer className="bg-white border-t border-gray-150 py-8 text-center text-xs text-gray-500 leading-normal" id="propspace-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans font-bold text-gray-800 tracking-tight">PropSpace Premium Property listing Network</p>
          <p>Zero commissions. Full security verification. Salted password hashing & JWT token sessions standards.</p>
          <p className="text-[10px] text-gray-400">© 2026 PropSpace Inc. All rights reserved. Generated on {new Date().getFullYear()}.</p>
        </div>
      </footer>

      {/* Add / Edit Listing Form Modal Component */}
      <PropertyForm 
        isOpen={formOpen} 
        onClose={() => {
          setFormOpen(false);
          setEditingProperty(null);
        }} 
        onSubmit={handleFormSubmit}
        propertyToEdit={editingProperty}
      />

    </div>
  );
}

// Wrapper to map the Provider store
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
