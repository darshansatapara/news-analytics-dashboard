"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import {
  Newspaper,
  Database,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Zap,
  RefreshCw,
} from "lucide-react";
import CategoryChart from "./CategoryChart";
import DailyTrendChart from "./DailyTrendChart";
import SourcesChart from "./SourcesChart";
import ScoreDistributionChart from "./ScoreDistributionChart";
import RecentArticles from "./RecentArticles";
import FetchingStats from "./FetchingStats";
import TimeRangeSelector from "./TimeRangeSelector";
import { motion } from "framer-motion";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/dashboard?range=${timeRange}`
      );
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-sm sm:text-base text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <p className="text-gray-400 mb-4">No data available</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, engagement, fetchingStats } = dashboardData;

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            News Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Real-time news aggregation and analytics
          </p>
        </div>

        <div className="shrink-0">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Articles"
          value={overview?.totalArticles || 0}
          icon={Newspaper}
          trend={overview?.articlesTrend > 0 ? "up" : "down"}
          trendValue={Math.abs(overview?.articlesTrend || 0)}
          color="blue"
          description="Total number of articles in the selected time range"
        />
        <StatsCard
          title="Today's Articles"
          value={overview?.todayArticles || 0}
          icon={Activity}
          color="green"
          description="Articles published today"
        />
        <StatsCard
          title="Total Sources"
          value={overview?.totalSources || 0}
          icon={Database}
          color="purple"
          description="Unique news sources tracked"
        />
        <StatsCard
          title="Total Views"
          value={engagement?.totalViews || 0}
          icon={Eye}
          color="orange"
          description="Cumulative article views"
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Likes"
          value={engagement?.totalLikes || 0}
          icon={Heart}
          color="red"
          description="Total likes across all articles"
        />
        <StatsCard
          title="AI Generations"
          value={engagement?.totalAIGenerations || 0}
          icon={Zap}
          color="cyan"
          description="AI-generated content count"
        />
        <StatsCard
          title="Avg Engagement"
          value={Math.round((engagement?.avgViews || 0) + (engagement?.avgLikes || 0))}
          icon={TrendingUp}
          color="green"
          description="Average engagement per article"
          subtitle={`${engagement?.avgViews || 0} views + ${engagement?.avgLikes || 0} likes`}
        />
      </div>

      {/* Charts Grid - Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <CategoryChart data={dashboardData?.categoryBreakdown} />
        <SourcesChart data={dashboardData?.topSources} />
      </div>

      {/* Daily Trend - Full Width */}
      <div className="w-full">
        <DailyTrendChart data={dashboardData?.dailyTrend} />
      </div>

      {/* Score Distribution - Full Width */}
      <div className="w-full">
        <ScoreDistributionChart data={dashboardData?.scoreDistribution} />
      </div>

      {/* Bottom Section - Recent Articles & Fetching Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <RecentArticles articles={dashboardData?.recentArticles} />
        <FetchingStats data={fetchingStats} />
      </div>
    </div>
  );
}
