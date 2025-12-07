import React, { useState } from 'react';
import { Package, Bell, Menu, X, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const NavItem = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => {
        onNavigate(id);
        setIsMobileMenuOpen(false);
      }}
      className={`relative px-4 py-2 transition-colors duration-200 text-sm font-medium ${
        currentPage === id
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
      {currentPage === id && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-text-primary rounded-full"></span>
      )}
    </button>
  );

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <Package
              size={22}
              className="text-text-primary transition-transform group-hover:scale-110"
            />
            <span className="text-xl font-semibold tracking-tight text-text-primary">Equip</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavItem id="dashboard" label="Overview" />
            <NavItem id="equipment" label="Inventory" />
            <NavItem id="loans" label="Activity" />
            {user?.role === 'ADMIN' && <NavItem id="admin" label="Admin" />}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <Search
                size={16}
                className="text-text-secondary absolute left-0 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-text-primary"
              />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none text-text-primary text-sm py-1.5 pl-6 pr-4 w-32 focus:w-48 transition-all placeholder:text-text-tertiary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 border-l border-border pl-6">
              <button
                onClick={toggleTheme}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="text-text-secondary hover:text-text-primary transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-0 right-0.5 w-1.5 h-1.5 bg-danger rounded-full"></span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2"
                title={user ? `${user.vorname} ${user.nachname}` : 'User'}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User"
                    className="w-8 h-8 rounded-full bg-surfaceHighlight object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-secondary text-sm font-medium">
                    {user?.vorname?.[0] || 'U'}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-primary p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button
              onClick={() => {
                onNavigate('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-3 text-text-primary border-b border-border"
            >
              Overview
            </button>
            <button
              onClick={() => {
                onNavigate('equipment');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-3 text-text-secondary border-b border-border"
            >
              Inventory
            </button>
            <button
              onClick={() => {
                onNavigate('loans');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-3 text-text-secondary border-b border-border"
            >
              Activity
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-text-secondary border-b border-border"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left py-3 text-danger mt-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

