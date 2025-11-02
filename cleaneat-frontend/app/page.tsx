"use client";

import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";

export default function HomePage() {
  const { isConnected, connect } = useWallet();

  const features = [
    {
      icon: "🔒",
      title: "End-to-End Encryption",
      description: "Your ratings are encrypted on device before submission",
    },
    {
      icon: "📊",
      title: "Zero Tampering",
      description: "Transparent ranking with cryptographic guarantees",
    },
    {
      icon: "🏆",
      title: "Anonymous Impact",
      description: "Improve canteen quality without revealing identity",
    },
    {
      icon: "⚡",
      title: "FHEVM Powered",
      description: "Compute on encrypted data using cutting-edge technology",
    },
  ];

  const coreFeatures = [
    {
      icon: "✍️",
      title: "Encrypted Rating",
      description: "Submit nutrition & satisfaction scores privately with full encryption",
      delay: "0s",
    },
    {
      icon: "🏆",
      title: "Public Leaderboard",
      description: "View canteen rankings based on aggregated encrypted data",
      delay: "0.1s",
    },
    {
      icon: "📝",
      title: "Personal History",
      description: "Track your ratings and decrypt your own submissions",
      delay: "0.2s",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Authorized staff can view aggregated insights and trends",
      delay: "0.3s",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Connect Wallet",
      description: "Use MetaMask or any compatible Web3 wallet to get started",
    },
    {
      number: "2",
      title: "Rate Dishes",
      description: "Submit encrypted scores for nutrition and satisfaction after your meal",
    },
    {
      number: "3",
      title: "On-Chain Aggregation",
      description: "FHEVM computes statistics without revealing individual ratings",
    },
    {
      number: "4",
      title: "View Results",
      description: "Check public leaderboard or decrypt your personal ratings anytime",
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="container-custom animate-fade-in" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div className="text-center" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="text-7xl mb-6 animate-slide-down">🍽️</div>
          <h1 
            className="font-bold mb-4 animate-slide-up" 
            style={{ 
              fontSize: '3.5rem', 
              color: 'var(--color-primary)',
              lineHeight: '1.2',
            }}
          >
            NorthTing CleanEat
          </h1>
          <p 
            className="mb-8 animate-slide-up" 
            style={{ 
              fontSize: '1.5rem',
              color: 'var(--color-text-secondary)',
              animationDelay: '0.1s',
            }}
          >
            Privacy-Preserving Canteen Rating System
          </p>
          <p 
            className="mb-12 animate-slide-up" 
            style={{ 
              fontSize: '1.125rem',
              color: 'var(--color-text-tertiary)',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              animationDelay: '0.2s',
            }}
          >
            Rate your meals with complete privacy. Built on FHEVM technology for encrypted on-chain computation.
          </p>

          {/* Quick Features Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="card animate-slide-up"
                style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                  animationDelay: `${0.3 + index * 0.1}s`,
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                  {feature.icon}
                </div>
                <h3 
                  style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.7s' }}
          >
            {isConnected ? (
              <Link 
                href="/submit" 
                className="btn-primary"
                style={{
                  fontSize: '1.125rem',
                  padding: '0.875rem 2.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                }}
              >
                🚀 Start Rating Now
              </Link>
            ) : (
              <button 
                onClick={connect} 
                className="btn-primary"
                style={{
                  fontSize: '1.125rem',
                  padding: '0.875rem 2.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                }}
              >
                🔐 Connect Wallet & Start
              </button>
            )}
            <a 
              href="#how-it-works" 
              className="btn-outline"
              style={{
                fontSize: '1.125rem',
                padding: '0.875rem 2.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
              }}
            >
              📖 Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="container-custom"
        style={{
          paddingTop: '3rem',
          paddingBottom: '3rem',
          borderTop: '1px solid var(--color-border-default)',
          borderBottom: '1px solid var(--color-border-default)',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "5", label: "Stalls", icon: "🏪" },
            { number: "2", label: "Score Types", icon: "📊" },
            { number: "100%", label: "Private", icon: "🔒" },
            { number: "0", label: "Data Leaks", icon: "🛡️" },
          ].map((stat, index) => (
            <div key={index}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div 
                style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.number}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="container-custom" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <h2 
          className="font-bold text-center mb-4"
          style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
        >
          Core Features
        </h2>
        <p 
          className="text-center mb-12"
          style={{ 
            fontSize: '1.125rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 3rem',
          }}
        >
          Everything you need for private, secure, and transparent canteen ratings
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="card animate-slide-up"
              style={{
                padding: '2rem',
                textAlign: 'center',
                animationDelay: feature.delay,
              }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section 
        id="how-it-works" 
        className="container-custom"
        style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
      >
        <div 
          className="card"
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '3rem',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          <h2 
            className="font-bold text-center mb-4"
            style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
          >
            How It Works
          </h2>
          <p 
            className="text-center mb-12"
            style={{ 
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            Get started in 4 simple steps
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-4"
                style={{ gap: '1.5rem' }}
              >
                <div 
                  className="flex-shrink-0"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)',
                  }}
                >
                  {step.number}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 
                    style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="text-center mt-12"
            style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              borderRadius: '0.75rem',
              border: '2px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <p style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              <strong>🔐 Powered by FHEVM:</strong> Fully Homomorphic Encryption allows computation on encrypted data
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Your individual ratings remain private while aggregate statistics are publicly verifiable
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="container-custom text-center"
        style={{
          paddingTop: '3rem',
          paddingBottom: '3rem',
          borderTop: '1px solid var(--color-border-default)',
          marginTop: '4rem',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Powered by <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>FHEVM</span> | Built with Zama Technologies
        </p>
        <div 
          className="flex justify-center space-x-6"
          style={{ fontSize: '0.875rem' }}
        >
          <a 
            href="#" 
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            GitHub
          </a>
          <a 
            href="#" 
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            Documentation
          </a>
          <a 
            href="#" 
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}
