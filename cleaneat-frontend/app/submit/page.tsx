"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { useWallet } from "../../hooks/useWallet";
import { useCleanEat } from "../../hooks/useCleanEat";

const STALLS = [
  { id: 0, name: "Stall A - Sichuan Cuisine", icon: "🌶️", description: "Spicy and flavorful" },
  { id: 1, name: "Stall B - Cantonese Cuisine", icon: "🥢", description: "Fresh and light" },
  { id: 2, name: "Stall C - Western Fast Food", icon: "🍔", description: "Quick and satisfying" },
  { id: 3, name: "Stall D - Noodle Bar", icon: "🍜", description: "Warm and comforting" },
  { id: 4, name: "Stall E - Vegetarian Options", icon: "🥗", description: "Healthy and green" },
];

export default function SubmitRatingPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { submitRating, isLoading } = useCleanEat();

  const [stallId, setStallId] = useState(0);
  const [nutritionScore, setNutritionScore] = useState(75);
  const [satisfactionScore, setSatisfactionScore] = useState(75);
  const [comment, setComment] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hash = await submitRating({
      stallId,
      nutritionScore,
      satisfactionScore,
      comment,
    });

    if (hash) {
      setTxHash(hash);
      setTimeout(() => router.push("/my-ratings"), 3000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
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
            Please connect your wallet to submit encrypted ratings
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
            <h1 
              className="font-bold mb-2"
              style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
            >
              Submit Rating
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
              Your scores are encrypted locally before submission
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stall Selection */}
            <div 
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <label 
                className="block font-medium mb-3"
                style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
              >
                <span style={{ marginRight: '0.5rem' }}>🏪</span>
                Select Stall
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STALLS.map((stall) => (
                  <button
                    key={stall.id}
                    type="button"
                    onClick={() => setStallId(stall.id)}
                    className="text-left p-4 rounded-lg transition-all"
                    style={{
                      backgroundColor: stallId === stall.id 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'var(--color-bg-tertiary)',
                      border: stallId === stall.id 
                        ? '2px solid var(--color-primary)' 
                        : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span style={{ fontSize: '2rem' }}>{stall.icon}</span>
                      <div>
                        <div 
                          className="font-medium"
                          style={{ 
                            fontSize: '0.9375rem',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {stall.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                          {stall.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Score */}
            <div 
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <label 
                className="block font-medium mb-4"
                style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
              >
                <span style={{ marginRight: '0.5rem' }}>🥗</span>
                Nutrition Score
              </label>
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="font-bold"
                  style={{
                    fontSize: '2rem',
                    color: getScoreColor(nutritionScore),
                  }}
                >
                  {nutritionScore}
                </div>
                <div 
                  className="badge"
                  style={{
                    backgroundColor: `${getScoreColor(nutritionScore)}20`,
                    color: getScoreColor(nutritionScore),
                    padding: '0.375rem 0.875rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  {getScoreLabel(nutritionScore)}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={nutritionScore}
                onChange={(e) => setNutritionScore(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, ${getScoreColor(nutritionScore)} 0%, ${getScoreColor(nutritionScore)} ${nutritionScore}%, var(--color-border-default) ${nutritionScore}%, var(--color-border-default) 100%)`,
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem' }}>
                🔒 Rate the nutritional quality (1=poor, 100=excellent) - Encrypted
              </p>
            </div>

            {/* Satisfaction Score */}
            <div 
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <label 
                className="block font-medium mb-4"
                style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
              >
                <span style={{ marginRight: '0.5rem' }}>😋</span>
                Satisfaction Score
              </label>
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="font-bold"
                  style={{
                    fontSize: '2rem',
                    color: getScoreColor(satisfactionScore),
                  }}
                >
                  {satisfactionScore}
                </div>
                <div 
                  className="badge"
                  style={{
                    backgroundColor: `${getScoreColor(satisfactionScore)}20`,
                    color: getScoreColor(satisfactionScore),
                    padding: '0.375rem 0.875rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  {getScoreLabel(satisfactionScore)}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={satisfactionScore}
                onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, ${getScoreColor(satisfactionScore)} 0%, ${getScoreColor(satisfactionScore)} ${satisfactionScore}%, var(--color-border-default) ${satisfactionScore}%, var(--color-border-default) 100%)`,
                  outline: 'none',
                }}
              />
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem' }}>
                🔒 Rate your overall satisfaction (1=poor, 100=excellent) - Encrypted
              </p>
            </div>

            {/* Comment */}
            <div 
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <label 
                className="block font-medium mb-3"
                style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
              >
                <span style={{ marginRight: '0.5rem' }}>💬</span>
                Optional Public Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={200}
                rows={4}
                className="input textarea"
                placeholder="Share your thoughts about the food, service, or experience..."
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                  ⚠️ This comment is <strong>not encrypted</strong> and will be publicly visible
                </p>
                <span 
                  style={{ 
                    fontSize: '0.8125rem',
                    color: comment.length > 180 ? '#ef4444' : 'var(--color-text-tertiary)',
                    fontWeight: comment.length > 180 ? 600 : 400,
                  }}
                >
                  {comment.length}/200
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
              style={{
                fontSize: '1.125rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px' }} />
                  <span>Encrypting & Submitting...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Submit Encrypted Rating</span>
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <div 
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--color-primary)' }}>🛡️ Privacy Guaranteed:</strong> Your nutrition and satisfaction scores are encrypted on your device using FHEVM technology before being submitted to the blockchain. Only you can decrypt your individual ratings.
              </p>
            </div>

            {/* Success Message */}
            {txHash && (
              <div 
                className="animate-slide-up"
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '0.75rem',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <p 
                  className="font-medium mb-2"
                  style={{ fontSize: '1rem', color: '#16a34a' }}
                >
                  ✅ Rating submitted successfully!
                </p>
                <p 
                  className="font-mono break-all mb-3"
                  style={{ fontSize: '0.75rem', color: '#15803d' }}
                >
                  TX: {txHash}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#15803d' }}>
                  Redirecting to My Ratings in 3 seconds...
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
