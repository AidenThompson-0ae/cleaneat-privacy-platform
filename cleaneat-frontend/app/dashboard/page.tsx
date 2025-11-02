"use client";

import { useState, useEffect } from "react";
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

export default function DashboardPage() {
  const { isConnected, provider, account } = useWallet();
  const { contract, isAuthorized, getAllStallAggregates, getThresholds } = useCleanEat();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stallData, setStallData] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState({ nutrition: 70, satisfaction: 75 });
  const storage = new GenericStringStorage("fhevm");

  useEffect(() => {
    if (isConnected && contract) {
      checkAuthorization();
    }
  }, [isConnected, contract]);

  const checkAuthorization = async () => {
    const auth = await isAuthorized();
    console.log("🔐 Authorization check:", auth, "for account:", account);
    setAuthorized(auth);
    
    if (auth) {
      await loadData();
    }
    setLoading(false);
  };

  const loadData = async () => {
    let signer = null;
    if (provider && account) {
      try {
        const ethersProvider = new BrowserProvider(provider);
        signer = await ethersProvider.getSigner(account);
      } catch (e) {
        console.warn("Could not get signer for decryption");
      }
    }

    const [aggregates, thresholdsData] = await Promise.all([
      getAllStallAggregates(signer, storage),
      getThresholds(),
    ]);

    if (thresholdsData) {
      setThresholds(thresholdsData);
    }

    const data = aggregates.map((agg, idx) => ({
      stallId: idx,
      name: STALLS[idx].name,
      icon: STALLS[idx].icon,
      avgNutrition: agg.avgNutrition,
      avgSatisfaction: agg.avgSatisfaction,
      totalRatings: agg.totalRatings,
      needsImprovement:
        agg.totalRatings > 0 &&
        (agg.avgNutrition < thresholds.nutrition || agg.avgSatisfaction < thresholds.satisfaction),
    }));

    setStallData(data);
  };

  const getSuggestions = (stall: any) => {
    const suggestions = [];
    if (stall.avgNutrition < thresholds.nutrition) {
      suggestions.push({
        icon: "🥗",
        text: "Increase vegetable portions and healthy options to improve nutrition score",
      });
      suggestions.push({
        icon: "📊",
        text: `Current: ${stall.avgNutrition} | Target: ${thresholds.nutrition}+`,
      });
    }
    if (stall.avgSatisfaction < thresholds.satisfaction) {
      suggestions.push({
        icon: "⏱️",
        text: "Improve service speed and reduce customer waiting time",
      });
      suggestions.push({
        icon: "🔥",
        text: "Enhance food temperature control and freshness",
      });
      suggestions.push({
        icon: "📊",
        text: `Current: ${stall.avgSatisfaction} | Target: ${thresholds.satisfaction}+`,
      });
    }
    return suggestions;
  };

  const exportData = () => {
    const csv = [
      "Stall ID,Stall Name,Avg Nutrition,Avg Satisfaction,Total Ratings,Status",
      ...stallData.map((s) =>
        `${s.stallId},"${s.name}",${s.avgNutrition},${s.avgSatisfaction},${s.totalRatings},${
          s.needsImprovement ? "Need Improvement" : "Top Performer"
        }`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleaneat-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
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
            Please connect your wallet to access the dashboard
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
        <Navbar />
        <div className="container-custom text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="spinner mx-auto mb-4" style={{ width: '50px', height: '50px' }} />
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
        <Navbar />
        <div className="container-custom text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div 
            className="card"
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              padding: '3rem 2rem',
            }}
          >
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🚫</div>
            <h2 
              className="font-bold mb-3"
              style={{ fontSize: '2rem', color: 'var(--color-text-primary)' }}
            >
              Access Denied
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Only authorized logistics staff can view this page
            </p>
            <div 
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                If you believe this is an error, please contact the system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topPerformers = stallData.filter(s => !s.needsImprovement && s.totalRatings > 0);
  const needsImprovement = stallData.filter(s => s.needsImprovement);
  const noData = stallData.filter(s => s.totalRatings === 0);
  const totalRatings = stallData.reduce((sum, s) => sum + s.totalRatings, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Navbar />
      
      <div className="container-custom animate-fade-in" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span style={{ fontSize: '2.5rem' }}>📊</span>
              <h1 
                className="font-bold"
                style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
              >
                Logistics Dashboard
              </h1>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
              Authorized access • Real-time aggregated insights
            </p>
          </div>
          <button 
            onClick={exportData}
            className="btn-secondary"
            style={{
              fontSize: '0.9375rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📥</span>
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Ratings", value: totalRatings, icon: "📝", color: '#3b82f6' },
            { label: "Top Performers", value: topPerformers.length, icon: "🏆", color: '#22c55e' },
            { label: "Need Attention", value: needsImprovement.length, icon: "⚠️", color: '#f59e0b' },
            { label: "No Data", value: noData.length, icon: "📊", color: '#6b7280' },
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="card text-center"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div 
                className="font-bold mb-1"
                style={{ 
                  fontSize: '2rem',
                  color: stat.color,
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

        {/* Stall Overview Cards */}
        <h2 
          className="font-bold mb-4"
          style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}
        >
          Stall Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stallData.map((stall, idx) => (
            <div 
              key={stall.stallId}
              className="card animate-slide-up"
              style={{ 
                padding: '1.75rem',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              {/* Stall Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span style={{ fontSize: '2rem' }}>{stall.icon}</span>
                  <h3 
                    className="font-semibold"
                    style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)' }}
                  >
                    {stall.name.split(' - ')[0]}
                  </h3>
                </div>
                {stall.totalRatings === 0 ? (
                  <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                    No Data
                  </span>
                ) : stall.needsImprovement ? (
                  <span className="badge badge-warning">⚠️</span>
                ) : (
                  <span className="badge badge-success">🏆</span>
                )}
              </div>

              {/* Scores */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      Nutrition Score
                    </span>
                    <span 
                      className="font-bold"
                      style={{ 
                        fontSize: '1.25rem',
                        color: stall.totalRatings > 0 ? getScoreColor(stall.avgNutrition) : 'var(--color-text-tertiary)',
                      }}
                    >
                      {stall.totalRatings > 0 ? stall.avgNutrition : '-'}
                    </span>
                  </div>
                  {stall.totalRatings > 0 && (
                    <div 
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div 
                        style={{
                          height: '100%',
                          width: `${stall.avgNutrition}%`,
                          backgroundColor: getScoreColor(stall.avgNutrition),
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      Satisfaction Score
                    </span>
                    <span 
                      className="font-bold"
                      style={{ 
                        fontSize: '1.25rem',
                        color: stall.totalRatings > 0 ? getScoreColor(stall.avgSatisfaction) : 'var(--color-text-tertiary)',
                      }}
                    >
                      {stall.totalRatings > 0 ? stall.avgSatisfaction : '-'}
                    </span>
                  </div>
                  {stall.totalRatings > 0 && (
                    <div 
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div 
                        style={{
                          height: '100%',
                          width: `${stall.avgSatisfaction}%`,
                          backgroundColor: getScoreColor(stall.avgSatisfaction),
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total Ratings */}
              <div 
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  Total Ratings: 
                </span>
                <span 
                  className="font-bold ml-1"
                  style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
                >
                  {stall.totalRatings}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Improvement Suggestions */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 
            className="font-bold mb-6"
            style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}
          >
            <span style={{ marginRight: '0.5rem' }}>💡</span>
            Improvement Suggestions
          </h2>

          {needsImprovement.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h3 
                className="font-semibold mb-2"
                style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}
              >
                All Stalls Performing Well!
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
                No stalls currently need immediate attention
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {needsImprovement.map((stall, idx) => (
                <div 
                  key={stall.stallId}
                  className="animate-slide-up"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(249, 115, 22, 0.05)',
                    borderLeft: '4px solid #f97316',
                    borderRadius: '0.5rem',
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span style={{ fontSize: '2rem' }}>{stall.icon}</span>
                    <h3 
                      className="font-semibold"
                      style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}
                    >
                      {stall.name}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {getSuggestions(stall).map((suggestion, sidx) => (
                      <div 
                        key={sidx}
                        className="flex items-start space-x-2"
                        style={{ paddingLeft: '0.5rem' }}
                      >
                        <span style={{ fontSize: '1.125rem', marginTop: '0.125rem' }}>
                          {suggestion.icon}
                        </span>
                        <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                          {suggestion.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
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
            <strong style={{ color: 'var(--color-primary)' }}>🔐 Privacy Note:</strong> All data shown here is aggregated from encrypted ratings. Individual user ratings remain private and cannot be accessed. Threshold settings: Nutrition ≥ {thresholds.nutrition}, Satisfaction ≥ {thresholds.satisfaction}.
          </p>
        </div>
      </div>
    </div>
  );
}
