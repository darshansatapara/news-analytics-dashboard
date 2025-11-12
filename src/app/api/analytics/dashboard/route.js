import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range") || "7d";

    // Calculate accurate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date("2020-01-01");
    }

    // Calculate previous period for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate);

    // Parallel execution for all analytics
    const [
      currentPeriodCount,
      previousPeriodCount,
      todayArticles,
      totalSources,
      categoryBreakdown,
      dailyTrend,
      topSources,
      scoreDistribution,
      duplicateStats,
      recentArticles,
      engagementStats,
      fetchingStats,
      hourlyPattern,
      categoryGrowth,
    ] = await Promise.all([
      // Current period article count
      db.collection("news").countDocuments({
        createdAt: { $gte: startDate, $lte: now },
      }),

      // Previous period article count for trend calculation
      db.collection("news").countDocuments({
        createdAt: { $gte: previousStartDate, $lt: previousEndDate },
      }),

      // Today's articles (using date field for accuracy)
      db.collection("news").countDocuments({
        date: now.toISOString().split("T")[0],
      }),

      // Unique sources count (more accurate)
      db
        .collection("news")
        .aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: "$source" } },
          { $count: "total" },
        ])
        .toArray()
        .then((result) => result[0]?.total || 0),

      // Detailed category breakdown with accurate calculations
      db
        .collection("news")
        .aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              avgScore: { $avg: { $ifNull: ["$score", 0] } },
              avgHotness: { $avg: { $ifNull: ["$hotness", 0] } },
              totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
              totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Daily trend with accurate date grouping
      db
        .collection("news")
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
              avgScore: { $avg: { $ifNull: ["$score", 0] } },
              avgHotness: { $avg: { $ifNull: ["$hotness", 0] } },
              totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Top sources with comprehensive metrics
      db
        .collection("news")
        .aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$source",
              count: { $sum: 1 },
              avgScore: { $avg: { $ifNull: ["$score", 0] } },
              totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
              totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
              avgEngagement: {
                $avg: {
                  $add: [
                    { $ifNull: ["$viewsCount", 0] },
                    { $multiply: [{ $ifNull: ["$likesCount", 0] }, 2] },
                  ],
                },
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),

      // Accurate score distribution
      db
        .collection("news")
        .aggregate([
          { $match: { score: { $ne: null, $gte: 0 } } },
          {
            $bucket: {
              groupBy: "$score",
              boundaries: [0, 20, 40, 60, 80, 100],
              default: "Other",
              output: {
                count: { $sum: 1 },
                avgHotness: { $avg: { $ifNull: ["$hotness", 0] } },
                avgViews: { $avg: { $ifNull: ["$viewsCount", 0] } },
              },
            },
          },
        ])
        .toArray(),

      // Comprehensive duplicate statistics
      db
        .collection("newsmap")
        .aggregate([
          {
            $group: {
              _id: null,
              totalGroups: { $sum: 1 },
              totalDuplicates: { $sum: "$count" },
              avgDuplicatesPerGroup: { $avg: "$count" },
              maxDuplicates: { $max: "$count" },
              uniqueSources: { $addToSet: "$sources" },
            },
          },
          {
            $project: {
              totalGroups: 1,
              totalDuplicates: 1,
              avgDuplicatesPerGroup: { $round: ["$avgDuplicatesPerGroup", 2] },
              maxDuplicates: 1,
              duplicateRate: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$totalDuplicates", "$totalGroups"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
        ])
        .toArray(),

      // Recent articles (last 10)
      db
        .collection("news")
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({
          title: 1,
          source: 1,
          category: 1,
          publishedAt: 1,
          published_at: 1,
          score: 1,
          viewsCount: 1,
          articleId: 1,
          article_id: 1,
        })
        .toArray(),

      // Accurate engagement statistics
      db
        .collection("news")
        .aggregate([
          {
            $group: {
              _id: null,
              totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
              totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
              totalAIGenerations: {
                $sum: { $ifNull: ["$aiGenerationsCount", 0] },
              },
              avgViews: { $avg: { $ifNull: ["$viewsCount", 0] } },
              avgLikes: { $avg: { $ifNull: ["$likesCount", 0] } },
              articlesWithViews: {
                $sum: {
                  $cond: [{ $gt: [{ $ifNull: ["$viewsCount", 0] }, 0] }, 1, 0],
                },
              },
              articlesWithLikes: {
                $sum: {
                  $cond: [{ $gt: [{ $ifNull: ["$likesCount", 0] }, 0] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray(),

      // Fetching success rate calculation
      Promise.all([
        db
          .collection("gnews_logs")
          .aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: { $cond: [{ $eq: ["$error", null] }, 1, 0] },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
                avgArticlesPerRequest: {
                  $avg: { $ifNull: ["$articles_count", 0] },
                },
              },
            },
            {
              $project: {
                total: 1,
                successful: 1,
                totalArticles: 1,
                avgArticlesPerRequest: {
                  $round: ["$avgArticlesPerRequest", 2],
                },
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
              },
            },
          ])
          .toArray(),

        db
          .collection("rss_logs")
          .aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: { $cond: [{ $eq: ["$error", null] }, 1, 0] },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
                avgArticlesPerRequest: {
                  $avg: { $ifNull: ["$articles_count", 0] },
                },
              },
            },
            {
              $project: {
                total: 1,
                successful: 1,
                totalArticles: 1,
                avgArticlesPerRequest: {
                  $round: ["$avgArticlesPerRequest", 2],
                },
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
              },
            },
          ])
          .toArray(),
      ]),

      // Hourly pattern analysis
      db
        .collection("news")
        .aggregate([
          {
            $project: {
              hour: { $hour: { $ifNull: ["$publishedAt", "$createdAt"] } },
              score: 1,
              viewsCount: 1,
            },
          },
          {
            $group: {
              _id: "$hour",
              count: { $sum: 1 },
              avgScore: { $avg: { $ifNull: ["$score", 0] } },
              totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Category growth comparison
      db
        .collection("news")
        .aggregate([
          {
            $match: {
              createdAt: { $gte: previousStartDate },
            },
          },
          {
            $project: {
              category: 1,
              isPrevious: { $lt: ["$createdAt", startDate] },
            },
          },
          {
            $group: {
              _id: {
                category: "$category",
                period: { $cond: ["$isPrevious", "previous", "current"] },
              },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    // Calculate accurate trend percentage
    const articlesTrend =
      previousPeriodCount > 0
        ? parseFloat(
            (
              ((currentPeriodCount - previousPeriodCount) /
                previousPeriodCount) *
              100
            ).toFixed(2)
          )
        : currentPeriodCount > 0
        ? 100
        : 0;

    // Normalize recent articles
    const normalizedRecentArticles = recentArticles.map((article) => ({
      ...article,
      articleId: article.articleId || article.article_id,
      publishedAt: article.publishedAt || article.published_at,
    }));

    // Process category growth
    const categoryGrowthMap = {};
    categoryGrowth.forEach((item) => {
      if (!categoryGrowthMap[item._id.category]) {
        categoryGrowthMap[item._id.category] = { current: 0, previous: 0 };
      }
      categoryGrowthMap[item._id.category][item._id.period] = item.count;
    });

    const categoryGrowthData = Object.entries(categoryGrowthMap).map(
      ([category, data]) => ({
        category,
        current: data.current,
        previous: data.previous,
        growth:
          data.previous > 0
            ? parseFloat(
                (
                  ((data.current - data.previous) / data.previous) *
                  100
                ).toFixed(2)
              )
            : data.current > 0
            ? 100
            : 0,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalArticles: currentPeriodCount,
          todayArticles,
          totalSources,
          articlesTrend,
          timeRange,
          previousPeriodArticles: previousPeriodCount,
        },
        categoryBreakdown: categoryBreakdown.map((cat) => ({
          category: cat._id || "Unknown",
          count: cat.count,
          avgScore: Math.round(cat.avgScore * 10) / 10,
          avgHotness: Math.round(cat.avgHotness * 10) / 10,
          totalViews: cat.totalViews,
          totalLikes: cat.totalLikes,
          engagementRate:
            cat.count > 0
              ? Math.round((cat.totalViews / cat.count) * 10) / 10
              : 0,
        })),
        dailyTrend: dailyTrend.map((day) => ({
          date: day._id,
          count: day.count,
          avgScore: Math.round(day.avgScore * 10) / 10,
          avgHotness: Math.round(day.avgHotness * 10) / 10,
          totalViews: day.totalViews,
        })),
        topSources: topSources.map((source) => ({
          source: source._id || "Unknown",
          count: source.count,
          avgScore: Math.round(source.avgScore * 10) / 10,
          totalViews: source.totalViews,
          totalLikes: source.totalLikes,
          avgEngagement: Math.round(source.avgEngagement * 10) / 10,
        })),
        scoreDistribution: scoreDistribution.map((bucket) => ({
          range:
            bucket._id === "Other"
              ? "Other"
              : `${bucket._id}-${bucket._id + 20}`,
          count: bucket.count,
          avgHotness: Math.round(bucket.avgHotness * 10) / 10,
          avgViews: Math.round(bucket.avgViews * 10) / 10,
        })),
        duplicateStats: duplicateStats[0] || {
          totalGroups: 0,
          totalDuplicates: 0,
          avgDuplicatesPerGroup: 0,
          maxDuplicates: 0,
          duplicateRate: 0,
        },
        recentArticles: normalizedRecentArticles,
        engagement: {
          ...(engagementStats[0] || {}),
          engagementRate:
            engagementStats[0]?.totalViews > 0
              ? Math.round(
                  (engagementStats[0].totalLikes /
                    engagementStats[0].totalViews) *
                    100 *
                    10
                ) / 10
              : 0,
        },
        fetchingStats: {
          gnews: fetchingStats[0][0] || {
            total: 0,
            successful: 0,
            totalArticles: 0,
            successRate: 0,
          },
          rss: fetchingStats[1][0] || {
            total: 0,
            successful: 0,
            totalArticles: 0,
            successRate: 0,
          },
        },
        hourlyPattern,
        categoryGrowth: categoryGrowthData
          .sort((a, b) => b.growth - a.growth)
          .slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
