import React, { useState } from 'react';
import {Search, Brain, Loader2, Home, Image, Activity, Clock, Info, LogOut, User, Menu, Zap, Database, Shield, TrendingUp, BookOpen, Target, Sparkles, Eye, EyeOff } from 'lucide-react';
function MediCaT() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([
  { email: "admin@gmail.com", password: "admin123", name: "Admin" }
  ]);

const [authError, setAuthError] = useState('');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loginTab, setLoginTab] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [searchHistory, setSearchHistory] = useState([]);

  const [showHistory, setShowHistory] = useState(false);

  const API_URL = 'http://127.0.0.1:8000';

const handleLogin = (e) => {
  e.preventDefault();
  setAuthError('');

  const existingUser = users.find(
    (u) => u.email === loginEmail
  );

  if (!existingUser) {
    setAuthError("Account does not exist. Please sign up.");
    return;
  }

  if (existingUser.password !== loginPassword) {
    setAuthError("Incorrect password.");
    return;
  }

  setUser(existingUser);
  setCurrentPage('dashboard');
};


const handleSignup = (e) => {
  e.preventDefault();
  setAuthError('');

  const existingUser = users.find(
    (u) => u.email === signupEmail
  );

  if (existingUser) {
    setAuthError("You already have an account. Please login.");
    return;
  }

  const newUser = {
    email: signupEmail,
    password: signupPassword,
    name: signupName
  };

  // save user
  setUsers([...users, newUser]);

  // success message
  setAuthError("Account created successfully. Please login.");

  // clear signup fields
  setSignupEmail('');
  setSignupPassword('');
  setSignupName('');

  // switch to login tab
  setLoginTab('login');
};
const handleLogout = () => {
  setUser(null);
  setCurrentPage('login');
  setQuery('');
  setResults([]);
  setAuthError('');
};


  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: query,
          top_k: 5
        })
      });

      const data = await response.json();

      if (data.warning) {
        setError(data.warning);
      } else {
        setResults(data.results || []);
        setSearchHistory(prev => [
  {
    query: query,
    results: data.results || [],
    timestamp: new Date().toISOString(),
  },
  ...prev.slice(0, 4),
]);

      }
    } catch (err) {
      setError('Failed to connect to backend. Make sure the API is running on port 8000.');
    } finally {
      setLoading(false);
      setShowHistory(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentPage === 'login' && loginTab === 'login') {
        handleLogin(e);
      } else if (currentPage === 'login' && loginTab === 'signup') {
        handleSignup(e);
      } else {
        handleSearch();
      }
    }
  };

  // Login/Signup Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">MediCaT</h1>
              <p className="text-blue-200 text-sm">Medical Image Context & Analysis Tool</p>
            </div>

            {/* Login/Signup Card */}
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white border-opacity-20">
                <button
                  onClick={() => setLoginTab('login')}
                  className={`flex-1 py-4 text-center font-medium transition-all ${
                    loginTab === 'login' 
                      ? 'text-white bg-white bg-opacity-10 border-b-2 border-cyan-400' 
                      : 'text-blue-200 hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setLoginTab('signup')}
                  className={`flex-1 py-4 text-center font-medium transition-all ${
                    loginTab === 'signup' 
                      ? 'text-white bg-white bg-opacity-10 border-b-2 border-cyan-400' 
                      : 'text-blue-200 hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="p-8">
                {authError && (
                  <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    authError.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                  >
                  {authError}
                  </div>
                )}


                {loginTab === 'login' ? (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      Welcome Back 👋
                    </h2>
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <input
                          type="email"
                          placeholder="Akhilanacham05@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Login
                      </button>
                    </form>
                    <p className="text-center text-blue-200 text-sm mt-6">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setLoginTab('signup')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
                    <form onSubmit={handleSignup} className="space-y-5">
                      <div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl">
                        Save
                      </button>

                    </form>
                    <p className="text-center text-blue-200 text-sm mt-6">
                      Already have an account?{' '}
                      <button
                        onClick={() => setLoginTab('login')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Login
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard/Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Brain className="w-8 h-8" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">MEDICAT</h2>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${
              currentPage === 'dashboard' ? 'bg-white bg-opacity-20 border-l-4 border-cyan-400' : ''
            }`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Home</span>}
          </button>
          <button
            onClick={() => setCurrentPage('search')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${
              currentPage === 'search' ? 'bg-white bg-opacity-20 border-l-4 border-cyan-400' : ''
            }`}
          >
            <Image className="w-5 h-5" />
            {sidebarOpen && <span>Image Library</span>}
          </button>
          <button
            onClick={() => setCurrentPage('analysis')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${
              currentPage === 'analysis' ? 'bg-white bg-opacity-20 border-l-4 border-cyan-400' : ''
            }`}
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span>Analysis</span>}
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${
              currentPage === 'history' ? 'bg-white bg-opacity-20 border-l-4 border-cyan-400' : ''
            }`}
          >
            <Clock className="w-5 h-5" />
            {sidebarOpen && <span>History</span>}
          </button>
          <button
            onClick={() => setCurrentPage('about')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${
              currentPage === 'about' ? 'bg-white bg-opacity-20 border-l-4 border-cyan-400' : ''
            }`}
          >
            <Info className="w-5 h-5" />
            {sidebarOpen && <span>About</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all mt-4"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-blue-500 hover:bg-white hover:bg-opacity-10"
        >
          <Menu className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            {currentPage === 'dashboard' && 'Home'}
            {currentPage === 'search' && 'Image Library'}
            {currentPage === 'analysis' && 'Analysis'}
            {currentPage === 'history' && 'History'}
            {currentPage === 'about' && 'About'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-700 font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && (
            <div>
              {/* Hero Section */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-12 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="text-blue-100 font-medium">AI-Powered Medical Image Search</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 leading-tight">
                      Discover Medical Insights with <span className="text-cyan-200">Intelligent Search</span>
                    </h1>
                    <p className="text-blue-100 text-xl mb-8 max-w-2xl leading-relaxed">
                      MediSeek revolutionizes medical research by connecting thousands of medical images with their contextual data from biomedical literature. Search, analyze, and understand medical imagery like never before.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentPage('search')}
                        className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                      >
                        <Search className="w-5 h-5" />
                        Start Searching
                      </button>
                      <button
                        onClick={() => setCurrentPage('about')}
                        className="px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-opacity-30 transition-all border border-white border-opacity-30"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-96 h-80 bg-white bg-opacity-10 rounded-3xl backdrop-blur-md border border-white border-opacity-20 flex items-center justify-center p-8">
                      <div className="text-center">
                        <Brain className="w-32 h-32 mx-auto mb-4 opacity-80" />
                        <div className="text-2xl font-bold">2,783+</div>
                        <div className="text-blue-200">Medical Images</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">2,783+</div>
                  <div className="text-gray-600 text-sm">Medical Images</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 shadow-lg border border-cyan-200">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-cyan-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">1000+</div>
                  <div className="text-gray-600 text-sm">Research Papers</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-purple-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">AI-Powered</div>
                  <div className="text-gray-600 text-sm">Semantic Search</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">Secure</div>
                  <div className="text-gray-600 text-sm">User Authentication</div>
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Platform Features</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Intelligent Search</h3>
                    <p className="text-gray-600">
                      Search through thousands of medical images using natural language. Our AI understands medical terminology and context.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                      <Image className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Image Analysis</h3>
                    <p className="text-gray-600">
                      Automatic subfigure detection, caption extraction, and contextual reference linking from research papers.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">AI-Powered Insights</h3>
                    <p className="text-gray-600">
                      Leverage advanced machine learning models for semantic understanding and multimodal analysis.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Comprehensive Database</h3>
                    <p className="text-gray-600">
                      Access a vast collection of medical images from biomedical literature with full metadata.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <Activity className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-time Processing</h3>
                    <p className="text-gray-600">
                      Fast and efficient search results with real-time image processing and analysis capabilities.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Secure & Private</h3>
                    <p className="text-gray-600">
                      Enterprise-grade security with user authentication and secure data handling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Use Cases */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-6">Who Can Use MediSeek?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-semibold mb-3">Medical Researchers</h3>
                    <p className="text-blue-100">
                      Find relevant medical images from research papers quickly. Analyze patterns and trends across studies.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-semibold mb-3">Clinicians</h3>
                    <p className="text-blue-100">
                      Access reference images for diagnosis and treatment planning. Compare cases with research findings.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                    <h3 className="text-xl font-semibold mb-3">Students & Educators</h3>
                    <p className="text-blue-100">
                      Learn from comprehensive medical image collections. Study with contextual information and references.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'search' && (
            <div>
              {/* Search Section */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                  <Search className="w-6 h-6 text-pink-500" />
                  <h2 className="text-2xl font-semibold">MediSeek– Search</h2>
                </div>

                <div className="relative">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                        placeholder="Search (e.g., lung, Fig.1A)"
                        className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                      />
                      
                      {showHistory && searchHistory.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-500 font-medium">Saved Info</span>
                            <button 
                              onClick={() => setShowHistory(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Brain className="w-4 h-4" />
                            </button>
                          </div>
                          {searchHistory.map((item, idx) => (
  <button
    key={idx}
    onClick={() => {
      setQuery(item.query);
      setShowHistory(false);
    }}
    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-gray-700 border-b border-gray-100"
  >
    {item.query}
  </button>
))}

                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSearch}
                      disabled={loading || !query.trim()}
                      className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Results Section */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Searching medical images...</p>
                  </div>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-8">
                  {results.map((result, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">{result.fig_uri}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Score: {(result.score * 100).toFixed(1)}%
                          </span>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">{result.caption}</p>

                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-600 mb-3">Full Image</h4>
                          <img 
                            src={result.full_image} 
                            alt={result.fig_uri}
                            className="w-full rounded-lg border-2 border-gray-200"
                          />
                        </div>

                        {result.subfigures && result.subfigures.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Subfigures</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {result.subfigures.map((sub, subIdx) => (
                                <div key={subIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="text-center mb-2">
                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
                                      {sub.label}
                                    </span>
                                  </div>
                                  {sub.image && (
                                    <img 
                                      src={sub.image} 
                                      alt={`Subfigure ${sub.label}`}
                                      className="w-full rounded border border-gray-300"
                                    />
                                  )}
                                  {sub.subcaption && (
                                    <p className="text-sm text-gray-600 mt-2 text-center">
                                      {sub.subcaption}
                                    </p>
                                  )}

                                  
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.inline_refs && result.inline_refs !== "No inline references" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">References: </span>
                              {result.inline_refs}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && !error && query && (
                <div className="text-center py-20">
                  <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No results found for "{query}"</p>
                  <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {currentPage === 'analysis' && (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Analysis Tools</h3>
              <p className="text-gray-500">Advanced analysis features coming soon</p>
            </div>
          )}

          {currentPage === 'history' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Medical Searches</h3>
              {searchHistory.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No search history yet</p>
                  <p className="text-gray-400 text-sm mt-2">Your medical image searches will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchHistory.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.query}</h4>
                            <p className="text-sm text-gray-500">
                              {item.timestamp
                              ? new Date(item.timestamp).toLocaleString()
                            : "Date not available"}
</p>

                          </div>
                          <button
                            onClick={() => {
                              setQuery(item.query);
                              setCurrentPage('search');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Search Again
                          </button>
                        </div>
                        
                        {/* Display images from search results */}
                        {item.results && item.results.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 mb-3">Found Images:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {item.results.map((result, resultIdx) => (
                                <div key={resultIdx} className="relative group">
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                    <img 
                                      src={result.full_image} 
                                      alt={result.fig_uri}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600 truncate">{result.fig_uri}</p>
                                    <p className="text-xs text-blue-600 font-medium">
                                      Score: {(result.score * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentPage === 'about' && (
            <div className="space-y-8">
              {/* About Project Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">About MediSeek</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>MediSeek</strong> is an advanced medical image search and analysis platform that bridges <strong>medical imaging</strong> with <strong>natural language understanding</strong>. Our platform leverages cutting-edge AI and machine learning techniques to process and understand medical imagery from research papers and clinical sources.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By combining state-of-the-art natural language processing with computer vision, MediSeek creates a seamless experience for medical researchers, clinicians, and students to search, analyze, and understand medical images in context.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Capabilities</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span><strong>Semantic Search:</strong> Find medical images using natural language queries</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Image className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span><strong>Image Analysis:</strong> Automated caption extraction and subfigure detection</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span><strong>Contextual Data:</strong> Connect images with research paper references</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span><strong>AI-Powered:</strong> Advanced deep learning models for multimodal understanding</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediCaT;