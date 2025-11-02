"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { useWallet } from "../../hooks/useWallet";
import { useCleanEat } from "../../hooks/useCleanEat";
import { BrowserProvider } from "ethers";
import { GenericStringStorage } from "../../fhevm/GenericStringStorage";

const STALLS = [
  { name: "Stall A - Sichuan Cuisine", icon: "🌶️" },
  { name: "Stall B - Cantonese Cuisine", icon: "🥢" },
  { name: "Stall C - Western Fast Food", icon: "🍔" },
  { name: "Stall D - Noodle Bar", icon: "🍜" },
  { name: "Stall E - Vegetarian Options", icon: "🥗" },
];

export default function MyRatingsPage() {
  const { isConnected, provider, account } = useWallet();
  const { contract, getUserRatings, decryptRating } = useCleanEat();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decryptingId, setDecryptingId] = useState<number | null>(null);
  const storage = new GenericStringStorage("fhevm");

  useEffect(() => {
    if (isConnected && contract) {
      loadRatings();
    }
  }, [isConnected, contract]);

  const loadRatings = async () => {
    setLoading(true);
    const data = await getUserRatings();
    console.log("📋 Loaded ratings:", data);
    setRatings(data);
    setLoading(false);
  };

  const handleDecrypt = async (ratingId: number, idx: number) => {
    if (!provider || !account) return;

    setDecryptingId(ratingId);
    
    try {
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner(account);
      
      const decrypted = await decryptRating(ratingId, signer, storage);
      
      if (decrypted) {
        const updated = [...ratings];
        updated[idx] = {
          ...updated[idx],
          decryptedNutrition: decrypted.nutrition,
          decryptedSatisfaction: decrypted.satisfaction,
        };
        setRatings(updated);
      }
    } catch (err) {
      console.error("Decrypt failed:", err);
    }
    
    setDecryptingId(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 25) return 'Poor';
    return 'Very Poor';
  };

  if (!isConnected) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
        <Navbar />
        <div className="container-custom text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔐</div>
          <h2 
            className="font-bold mb-4"
            style={{ fontSize: '2rem', color: 'var(--color-text-primary)' }}
          >
            Wallet Connection Required
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Please connect your wallet to view your ratings
          </p>
          <button 
            className="btn-primary"
            style={{
              fontSize: '1rem',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
            }}
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Navbar />
      
      <div className="container-custom animate-fade-in" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h1 
            className="font-bold mb-2"
            style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
          >
            My Ratings
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
            View and decrypt your personal encrypted ratings
          </p>
        </div>

        {/* Stats Bar */}
        {!loading && ratings.length > 0 && (
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Ratings", value: ratings.length, icon: "📊" },
              { label: "Decrypted", value: ratings.filter(r => r.decryptedNutrition !== undefined).length, icon: "🔓" },
              { label: "Encrypted", value: ratings.filter(r => r.decryptedNutrition === undefined).length, icon: "🔒" },
              { label: "Stalls Rated", value: new Set(ratings.map(r => r.stallId)).size, icon: "🏪" },
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="card text-center"
                style={{ padding: '1.25rem' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div 
                  className="font-bold"
                  style={{ 
                    fontSize: '1.75rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div 
            className="card text-center"
            style={{ padding: '4rem 2rem' }}
          >
            <div className="spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Loading your ratings...
            </p>
          </div>
        ) : ratings.length === 0 ? (
          /* Empty State */
          <div 
            className="card text-center"
            style={{ padding: '4rem 2rem' }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📝</div>
            <h3 
              className="font-semibold mb-2"
              style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}
            >
              No Ratings Yet
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Start rating canteen stalls to see your history here
            </p>
            <Link 
              href="/submit"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
              }}
            >
              <span>✍️</span>
              <span>Submit Your First Rating</span>
            </Link>
          </div>
        ) : (
          /* Ratings List */
          <div className="space-y-4">
            {ratings.map((rating, idx) => {
              const stall = STALLS[rating.stallId];
              const isDecrypted = rating.decryptedNutrition !== undefined;
              
              return (
                <div 
                  key={rating.ratingId}
                  className="card animate-slide-up"
                  style={{ 
                    padding: '1.75rem',
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left: Stall Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span style={{ fontSize: '2.5rem' }}>{stall.icon}</span>
                        <div>
                          <h3 
                            className="font-semibold"
                            style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}
                          >
                            {stall.name}
                          </h3>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                            {new Date(rating.timestamp * 1000).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Scores Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Nutrition Score */}
                        <div 
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            borderRadius: '0.5rem',
                          }}
                        >
                          <div 
                            className="flex items-center justify-between mb-2"
                          >
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                              🥗 Nutrition
                            </span>
                            {isDecrypted && (
                              <span 
                                className="badge"
                                style={{
                                  backgroundColor: `${getScoreColor(rating.decryptedNutrition)}20`,
                                  color: getScoreColor(rating.decryptedNutrition),
                                  fontSize: '0.6875rem',
                                  padding: '0.25rem 0.5rem',
                                }}
                              >
                                {getScoreLabel(rating.decryptedNutrition)}
                              </span>
                            )}
                          </div>
                          <div 
                            className="font-bold"
                            style={{
                              fontSize: '2rem',
                              color: isDecrypted ? getScoreColor(rating.decryptedNutrition) : 'var(--color-text-tertiary)',
                            }}
                          >
                            {isDecrypted ? rating.decryptedNutrition : '🔒'}
                          </div>
                        </div>

                        {/* Satisfaction Score */}
                        <div 
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            borderRadius: '0.5rem',
                          }}
                        >
                          <div 
                            className="flex items-center justify-between mb-2"
                          >
                            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                              😋 Satisfaction
                            </span>
                            {isDecrypted && (
                              <span 
                                className="badge"
                                style={{
                                  backgroundColor: `${getScoreColor(rating.decryptedSatisfaction)}20`,
                                  color: getScoreColor(rating.decryptedSatisfaction),
                                  fontSize: '0.6875rem',
                                  padding: '0.25rem 0.5rem',
                                }}
                              >
                                {getScoreLabel(rating.decryptedSatisfaction)}
                              </span>
                            )}
                          </div>
                          <div 
                            className="font-bold"
                            style={{
                              fontSize: '2rem',
                              color: isDecrypted ? getScoreColor(rating.decryptedSatisfaction) : 'var(--color-text-tertiary)',
                            }}
                          >
                            {isDecrypted ? rating.decryptedSatisfaction : '🔒'}
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      {rating.comment && (
                        <div 
                          style={{
                            padding: '0.875rem',
                            backgroundColor: 'rgba(249, 115, 22, 0.05)',
                            borderLeft: '3px solid var(--color-secondary)',
                            borderRadius: '0.375rem',
                          }}
                        >
                          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            💬 Your Comment:
                          </p>
                          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', fontStyle: 'italic' }}>
                            "{rating.comment}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Decrypt Button */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-2">
                      {!isDecrypted ? (
                        <button
                          onClick={() => handleDecrypt(rating.ratingId, idx)}
                          disabled={decryptingId === rating.ratingId}
                          className="btn-secondary"
                          style={{
                            fontSize: '0.9375rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '140px',
                            justifyContent: 'center',
                          }}
                        >
                          {decryptingId === rating.ratingId ? (
                            <>
                              <div className="spinner" style={{ width: '16px', height: '16px' }} />
                              <span>Decrypting...</span>
                            </>
                          ) : (
                            <>
                              <span>🔓</span>
                              <span>Decrypt</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div 
                          className="badge badge-success"
                          style={{
                            fontSize: '0.875rem',
                            padding: '0.625rem 1.25rem',
                          }}
                        >
                          ✅ Decrypted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        {!loading && ratings.length > 0 && (
          <div 
            className="mt-8"
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--color-primary)' }}>🔐 Privacy Note:</strong> Your ratings are encrypted on-chain. Click "Decrypt" to view your actual scores. This requires signing a message with your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
