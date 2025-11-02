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

type Tab = "all" | "top" | "improvement";

export default function LeaderboardPage() {
  const { provider, account } = useWallet();
  const { contract, getAllStallAggregates, getThresholds } = useCleanEat();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [stallData, setStallData] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState({ nutrition: 70, satisfaction: 75 });
  const [loading, setLoading] = useState(true);
  const storage = new GenericStringStorage("fhevm");

  useEffect(() => {
    if (contract) {
      loadData();
    }
  }, [contract, provider, account]);

  const loadData = async () => {
    setLoading(true);
    
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

    console.log("📊 Loaded aggregates:", aggregates);

    const data = aggregates.map((agg, idx) => ({
      stallId: idx,
      name: STALLS[idx].name,
      icon: STALLS[idx].icon,
      avgNutrition: agg.avgNutrition,
      avgSatisfaction: agg.avgSatisfaction,
      totalRatings: agg.totalRatings,
      isTop: agg.avgNutrition >= thresholds.nutrition && agg.avgSatisfaction >= thresholds.satisfaction,
    }));

    data.sort((a, b) => (b.avgNutrition + b.avgSatisfaction) - (a.avgNutrition + a.avgSatisfaction));
    setStallData(data);
    setLoading(false);
  };

  const filteredData = stallData.filter((stall) => {
    if (activeTab === "all") return true;
    if (activeTab === "top") return stall.isTop && stall.totalRatings > 0;
    if (activeTab === "improvement") return !stall.isTop && stall.totalRatings > 0;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Navbar />
      
      <div className="container-custom animate-fade-in" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h1 
            className="font-bold mb-2"
            style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)' }}
          >
            Stall Leaderboard
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Rankings based on encrypted aggregated ratings
          </p>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>📊</span>
            <span>Threshold: Nutrition ≥ {thresholds.nutrition}, Satisfaction ≥ {thresholds.satisfaction}</span>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {[
            { key: "all" as Tab, label: "All Stalls", icon: "🏪", count: stallData.length },
            { key: "top" as Tab, label: "Top Performers", icon: "🏆", count: stallData.filter(s => s.isTop && s.totalRatings > 0).length },
            { key: "improvement" as Tab, label: "Need Improvement", icon: "⚠️", count: stallData.filter(s => !s.isTop && s.totalRatings > 0).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: activeTab === tab.key ? 'white' : 'var(--color-text-primary)',
                border: activeTab === tab.key ? 'none' : '1px solid var(--color-border-default)',
                boxShadow: activeTab === tab.key ? 'var(--shadow-md)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span 
                className="font-bold"
                style={{
                  backgroundColor: activeTab === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-bg-tertiary)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div 
            className="card text-center"
            style={{ padding: '4rem 2rem' }}
          >
            <div className="spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Loading leaderboard data...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div 
            className="card text-center"
            style={{ padding: '4rem 2rem' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
              No stalls found in this category
            </p>
          </div>
        ) : (
          /* Stall Cards (Mobile-friendly) */
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Rank</th>
                      <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Stall</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Nutrition</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Satisfaction</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Ratings</th>
                      <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((stall, idx) => (
                      <tr 
                        key={stall.stallId}
                        style={{
                          borderBottom: '1px solid var(--color-border-default)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{getRankMedal(idx + 1)}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <div className="flex items-center space-x-3">
                            <span style={{ fontSize: '2rem' }}>{stall.icon}</span>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{stall.name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
                          {stall.totalRatings > 0 ? (
                            <span 
                              className="font-bold"
                              style={{ fontSize: '1.125rem', color: getScoreColor(stall.avgNutrition) }}
                            >
                              {stall.avgNutrition}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
                          {stall.totalRatings > 0 ? (
                            <span 
                              className="font-bold"
                              style={{ fontSize: '1.125rem', color: getScoreColor(stall.avgSatisfaction) }}
                            >
                              {stall.avgSatisfaction}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
                          <span 
                            className="badge"
                            style={{
                              backgroundColor: 'var(--color-bg-tertiary)',
                              color: 'var(--color-text-primary)',
                              padding: '0.25rem 0.625rem',
                            }}
                          >
                            {stall.totalRatings}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
                          {stall.totalRatings === 0 ? (
                            <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                              No Data
                            </span>
                          ) : stall.isTop ? (
                            <span className="badge badge-success">🏆 Top</span>
                          ) : (
                            <span className="badge badge-warning">⚠️ Improve</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredData.map((stall, idx) => (
                <div 
                  key={stall.stallId}
                  className="card"
                  style={{ padding: '1.5rem' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span style={{ fontSize: '2.5rem' }}>{stall.icon}</span>
                      <div>
                        <div 
                          className="font-semibold mb-1"
                          style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)' }}
                        >
                          {stall.name}
                        </div>
                        <div style={{ fontSize: '1.25rem' }}>{getRankMedal(idx + 1)}</div>
                      </div>
                    </div>
                    <div>
                      {stall.totalRatings === 0 ? (
                        <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                          No Data
                        </span>
                      ) : stall.isTop ? (
                        <span className="badge badge-success">🏆 Top</span>
                      ) : (
                        <span className="badge badge-warning">⚠️ Improve</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
                        Nutrition
                      </div>
                      <div 
                        className="font-bold"
                        style={{ 
                          fontSize: '1.5rem',
                          color: stall.totalRatings > 0 ? getScoreColor(stall.avgNutrition) : 'var(--color-text-tertiary)',
                        }}
                      >
                        {stall.totalRatings > 0 ? stall.avgNutrition : '-'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
                        Satisfaction
                      </div>
                      <div 
                        className="font-bold"
                        style={{ 
                          fontSize: '1.5rem',
                          color: stall.totalRatings > 0 ? getScoreColor(stall.avgSatisfaction) : 'var(--color-text-tertiary)',
                        }}
                      >
                        {stall.totalRatings > 0 ? stall.avgSatisfaction : '-'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.25rem' }}>
                        Ratings
                      </div>
                      <div 
                        className="font-bold"
                        style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}
                      >
                        {stall.totalRatings}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
