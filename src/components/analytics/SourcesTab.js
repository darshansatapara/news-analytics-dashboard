'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Info, 
  Globe, 
  TrendingUp, 
  Target,
  Layers,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const InfoTooltip = ({ title, description }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        <Info className="w-4 h-4 text-gray-400" />
      </button>
      
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
          <div className="text-xs font-semibold text-white mb-1">{title}</div>
          <div className="text-xs text-gray-400">{description}</div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default function SourcesTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?type=sources&range=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading source analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Sources Performance */}
      {data.topSources && data.topSources.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Top Sources Performance
            </h3>
            <InfoTooltip 
              title="Top Sources"
              description="Most active sources ranked by article count, quality score, and engagement metrics."
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-xs font-semibold text-gray-400">Rank</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400">Source</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-400">Articles</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-400">Avg Score</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-400">Quality Rate</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-400">Total Views</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-400">Total Likes</th>
                </tr>
              </thead>
              <tbody>
                {data.topSources.slice(0, 15).map((source, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-700/20 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium">{source.source}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm font-bold text-blue-400">{source.count}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        source.avgScore >= 70 ? 'bg-green-500/10 text-green-400' :
                        source.avgScore >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {source.avgScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-purple-400">{source.qualityRate}%</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-gray-400">{source.totalViews?.toLocaleString() || 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-pink-400">{source.totalLikes?.toLocaleString() || 0}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Source Reliability & Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Reliability */}
        {data.reliability && data.reliability.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Publishing Consistency
              </h3>
              <InfoTooltip 
                title="Publishing Consistency"
                description="Sources ranked by their consistency in publishing articles daily."
              />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {data.reliability.slice(0, 10).map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs font-semibold text-blue-400">
                        {source.avgDailyArticles} avg/day
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{source.daysActive} days active</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${Math.min((source.avgDailyArticles / data.reliability[0].avgDailyArticles) * 100, 100)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Consistency */}
        {data.consistency && data.consistency.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Quality Consistency
              </h3>
              <InfoTooltip 
                title="Quality Consistency"
                description="Sources with the most consistent article quality scores (low standard deviation)."
              />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {data.consistency.slice(0, 10).map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        source.consistency >= 90 ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                        source.consistency >= 80 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {source.consistency}% consistent
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Avg Score: {source.avgScore}</span>
                    <span>{source.count} articles</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        source.consistency >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        source.consistency >= 80 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      style={{ width: `${source.consistency}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Spread & Duplicate Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spread */}
        {data.categorySpread && data.categorySpread.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-400" />
                Category Diversity
              </h3>
              <InfoTooltip 
                title="Category Diversity"
                description="Sources that cover the most diverse range of categories."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categorySpread.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="source" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="categories" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Categories Covered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Duplicate Behavior */}
        {data.duplicateBehavior && data.duplicateBehavior.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-pink-400" />
                Content Syndication Leaders
              </h3>
              <InfoTooltip 
                title="Syndication Behavior"
                description="Sources that most frequently share/republish content with other publishers."
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {data.duplicateBehavior.slice(0, 10).map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1">{source.source}</span>
                    <span className="px-2 py-1 bg-pink-500/10 border border-pink-500/30 rounded text-xs font-semibold text-pink-400">
                      {source.duplicateGroups} groups
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{source.totalDuplicates} total duplicates</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                      style={{ width: `${(source.duplicateGroups / data.duplicateBehavior[0].duplicateGroups) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
