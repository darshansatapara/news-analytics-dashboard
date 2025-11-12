'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Info, 
  Eye, 
  Heart, 
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart,
  Line,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
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

export default function EngagementTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?type=engagement`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading engagement analytics...</p>
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
      {/* Overall Engagement Metrics */}
      {data.overall && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <InfoTooltip 
                title="Total Views"
                description="Cumulative number of article views across the platform."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-blue-400">{data.overall.totalViews?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">
              Avg: {data.overall.avgViewsPerArticle} per article
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <InfoTooltip 
                title="Total Likes"
                description="Total number of likes across all articles."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Likes</p>
            <p className="text-3xl font-bold text-red-400">{data.overall.totalLikes?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">
              {data.overall.engagementRate}% engagement rate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <InfoTooltip 
                title="AI Generations"
                description="Number of times AI has been used for content generation."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">AI Generations</p>
            <p className="text-3xl font-bold text-purple-400">{data.overall.totalAI?.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <InfoTooltip 
                title="View Rate"
                description="Percentage of articles that have received at least one view."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">View Rate</p>
            <p className="text-3xl font-bold text-green-400">{data.overall.viewRate}%</p>
            <p className="text-xs text-gray-500 mt-2">
              Articles with views
            </p>
          </motion.div>
        </div>
      )}

      {/* Engagement by Score Range */}
      {data.byScore && data.byScore.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Engagement by Quality Score
            </h3>
            <InfoTooltip 
              title="Score vs Engagement"
              description="How article quality scores correlate with user engagement (views and likes)."
            />
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.byScore}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="scoreRange" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="totalViews" fill="#3B82F6" name="Total Views" radius={[8, 8, 0, 0]} />
              <Bar dataKey="totalLikes" fill="#EF4444" name="Total Likes" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avgViews" fill="#10B981" name="Avg Views" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Engagement Trend & Virality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend Over Time */}
        {data.trend && data.trend.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Engagement Trend (30 Days)</h3>
              <InfoTooltip 
                title="Engagement Trend"
                description="Daily engagement metrics showing views and likes over time."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalViews" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Views"
                />
                <Area 
                  type="monotone" 
                  dataKey="totalLikes" 
                  stroke="#EF4444" 
                  fillOpacity={1}
                  fill="url(#colorLikes)"
                  name="Likes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Virality Metrics */}
        {data.virality && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Viral Content Metrics
              </h3>
              <InfoTooltip 
                title="Viral Content"
                description="Statistics about high-performing articles (>100 views or >10 likes)."
              />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Viral Articles</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {data.virality.viralArticles?.toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Articles with exceptional engagement
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Peak Views</span>
                  </div>
                  <p className="text-xl font-bold text-blue-400">
                    {data.virality.maxViews?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-400">Peak Likes</span>
                  </div>
                  <p className="text-xl font-bold text-red-400">
                    {data.virality.maxLikes?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Total Viral Engagement</span>
                  <span className="text-lg font-bold text-purple-400">
                    {((data.virality.totalViews || 0) + (data.virality.totalLikes || 0) * 2).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                    style={{ 
                      width: `${Math.min(((data.virality.totalViews || 0) / 10000) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
