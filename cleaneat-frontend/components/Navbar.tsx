"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { isSupportedNetwork } from "../config/networks";

export function Navbar() {
  const pathname = usePathname();
  const { account, chainId, isConnected, isConnecting, connect, disconnect, switchNetwork } = useWallet();
  const [showMenu, setShowMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/submit", label: "Submit Rating", icon: "✍️", requiresWallet: true },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/my-ratings", label: "My Ratings", icon: "📝", requiresWallet: true },
    { href: "/dashboard", label: "Dashboard", icon: "📊", requiresWallet: true },
  ];

  // Navigation component with wallet integration

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Unknown";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getNetworkName = (id: number) => {
    if (id === 31337) return "Localhost";
    if (id === 11155111) return "Sepolia";
    return `Chain ${id}`;
  };

  const isNetworkSupported = chainId ? isSupportedNetwork(chainId) : false;

  return (
    <nav 
      className="sticky top-0 z-50 animate-slide-down"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between" style={{ height: '64px' }}>
          {/* Logo and Project Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div 
              className="text-3xl transition-transform group-hover:scale-110"
              style={{ transition: 'transform 0.2s ease' }}
            >
              🍽️
            </div>
            <div className="flex flex-col">
              <span 
                className="text-xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                NorthTing CleanEat
              </span>
              <span 
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Privacy-Preserving Ratings
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.requiresWallet && !isConnected) return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side: Network + Wallet */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Network Display */}
            {isConnected && chainId && (
              <div className="flex items-center space-x-2">
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1"
                  style={{
                    backgroundColor: isNetworkSupported 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    color: isNetworkSupported ? '#16a34a' : '#dc2626',
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isNetworkSupported ? '#22c55e' : '#ef4444',
                    }}
                  />
                  <span>{getNetworkName(chainId)}</span>
                </div>
                {!isNetworkSupported && (
                  <button
                    onClick={() => switchNetwork(31337)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#dc2626' }}
                  >
                    Switch Network
                  </button>
                )}
              </div>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary"
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {isConnecting ? (
                  <span className="flex items-center space-x-2">
                    <div className="spinner" style={{ width: '16px', height: '16px' }} />
                    <span>Connecting...</span>
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                  }}
                >
                  <span className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {formatAddress(account)}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAccountMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-lg py-2 animate-fade-in"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-default)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <Link
                      href="/my-ratings"
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--color-text-primary)' }}
                      onClick={() => setShowAccountMenu(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      📝 My Ratings
                    </Link>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowAccountMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      🚪 Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div 
            className="md:hidden py-4 animate-fade-in"
            style={{ borderTop: '1px solid var(--color-border-default)' }}
          >
            {navLinks.map((link) => {
              if (link.requiresWallet && !isConnected) return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium mb-1 transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  }}
                  onClick={() => setShowMenu(false)}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div 
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid var(--color-border-default)' }}
            >
              {!isConnected ? (
                <button
                  onClick={() => {
                    connect();
                    setShowMenu(false);
                  }}
                  disabled={isConnecting}
                  className="w-full btn-primary"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              ) : (
                <>
                  <div 
                    className="px-4 py-2 text-sm font-mono mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {account && formatAddress(account)}
                  </div>
                  {chainId && (
                    <div 
                      className="px-4 py-2 text-sm mb-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Network: {getNetworkName(chainId)}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      disconnect();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm rounded-md transition-colors"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
