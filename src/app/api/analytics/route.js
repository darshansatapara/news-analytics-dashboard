import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request) {
  let type = "unknown"; // ⭐ ADD THIS LINE
  let timeRange = "7d"; // ⭐ ADD THIS LINE
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    type = searchParams.get("type") || "overview"; // ⭐ REMOVE 'const'
    timeRange = searchParams.get("range") || "7d"; // ⭐ REMOVE 'const'

    console.log(`📊 Analytics API - Type: ${type}, Range: ${timeRange}`);

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

    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    let data = {};

    // ==================== OVERVIEW ANALYTICS ====================
    if (type === "overview") {
      console.log("⏳ Fetching overview...");

      const [
        currentPeriodCount,
        previousPeriodCount,
        todayArticles,
        totalSources,
        totalCategories,
        engagementStats,
        categoryDistribution,
        dailyTrend,
        hourlyPattern,
      ] = await Promise.all([
        db.collection("news").countDocuments({
          createdAt: { $gte: startDate, $lte: now },
        }),

        db.collection("news").countDocuments({
          createdAt: { $gte: previousStartDate, $lt: startDate },
        }),

        db.collection("news").countDocuments({
          date: now.toISOString().split("T")[0],
        }),

        db
          .collection("news")
          .distinct("source")
          .then((sources) => sources.length),
        db
          .collection("news")
          .distinct("category")
          .then((cats) => cats.length),

        db
          .collection("news")
          .aggregate([
            {
              $group: {
                _id: null,
                totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                totalAI: { $sum: { $ifNull: ["$aiGenerationsCount", 0] } },
                totalArticles: { $sum: 1 },
              },
            },
            {
              $project: {
                totalViews: 1,
                totalLikes: 1,
                totalAI: 1,
                avgViewsPerArticle: {
                  $round: [{ $divide: ["$totalViews", "$totalArticles"] }, 2],
                },
                engagementRate: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalLikes",
                            { $add: ["$totalViews", 1] },
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 8 },
            {
              $project: {
                name: "$_id",
                count: 1,
                _id: 0,
              },
            },
          ])
          .toArray(),

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
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                count: 1,
                avgScore: { $round: ["$avgScore", 1] },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            {
              $project: {
                hour: {
                  $hour: {
                    date: { $ifNull: ["$publishedAt", "$createdAt"] },
                    timezone: "UTC",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$hour",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
      ]);

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

      data = {
        overview: {
          totalArticles: currentPeriodCount,
          todayArticles,
          totalSources,
          totalCategories,
          articlesTrend,
          previousPeriodArticles: previousPeriodCount,
        },
        engagement: engagementStats[0] || {
          totalViews: 0,
          totalLikes: 0,
          totalAI: 0,
          avgViewsPerArticle: 0,
          engagementRate: 0,
        },
        categoryDistribution,
        dailyTrend,
        hourlyPattern,
      };

      console.log("✅ Overview complete");
    }

    // ==================== CORRELATIONS - OPTIMIZED ====================
    else if (type === "categories") {
      console.log("⏳ Fetching categories...");

      const [
        categoryEngagement,
        categoryQuality,
        categoryGrowth,
        categoryDuplicates,
        categorySourceDiversity,
      ] = await Promise.all([
        // Category Engagement
        db
          .collection("news")
          .aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: "$category",
                totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                count: { $sum: 1 },
                avgViews: { $avg: { $ifNull: ["$viewsCount", 0] } },
              },
            },
            {
              $project: {
                category: "$_id",
                totalViews: 1,
                totalLikes: 1,
                count: 1,
                avgViews: { $round: ["$avgViews", 2] },
                _id: 0,
              },
            },
            { $sort: { totalViews: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        // Category Quality
        db
          .collection("news")
          .aggregate([
            {
              $match: {
                score: { $ne: null, $exists: true },
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: "$category",
                avgScore: { $avg: "$score" },
                avgHotness: { $avg: { $ifNull: ["$hotness", 0] } },
                count: { $sum: 1 },
                highQuality: {
                  $sum: { $cond: [{ $gte: ["$score", 70] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                category: "$_id",
                avgScore: { $round: ["$avgScore", 2] },
                avgHotness: { $round: ["$avgHotness", 2] },
                count: 1,
                qualityRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$highQuality", "$count"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
            { $sort: { avgScore: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        // Category Growth
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
                period: {
                  $cond: [
                    { $lt: ["$createdAt", startDate] },
                    "previous",
                    "current",
                  ],
                },
              },
            },
            {
              $group: {
                _id: {
                  category: "$category",
                  period: "$period",
                },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),

        // Category Duplicates (simplified)
        db
          .collection("news")
          .aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $sample: { size: 2000 } },
            {
              $group: {
                _id: "$category",
                duplicateGroups: { $sum: 1 },
                totalDuplicates: { $sum: 1 },
              },
            },
            { $sort: { totalDuplicates: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        // Category Source Diversity
        db
          .collection("news")
          .aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  category: "$category",
                  source: "$source",
                },
              },
            },
            {
              $group: {
                _id: "$_id.category",
                uniqueSources: { $sum: 1 },
              },
            },
            {
              $project: {
                category: "$_id",
                uniqueSources: 1,
                _id: 0,
              },
            },
            { $sort: { uniqueSources: -1 } },
            { $limit: 15 },
          ])
          .toArray(),
      ]);

      // Process growth data
      const categoryGrowthMap = {};
      categoryGrowth.forEach((item) => {
        if (!categoryGrowthMap[item._id.category]) {
          categoryGrowthMap[item._id.category] = { current: 0, previous: 0 };
        }
        categoryGrowthMap[item._id.category][item._id.period] = item.count;
      });

      const categoryGrowthData = Object.entries(categoryGrowthMap)
        .map(([category, dataObj]) => ({
          category,
          current: dataObj.current,
          previous: dataObj.previous,
          growth:
            dataObj.previous > 0
              ? parseFloat(
                  (
                    ((dataObj.current - dataObj.previous) / dataObj.previous) *
                    100
                  ).toFixed(2)
                )
              : dataObj.current > 0
              ? 100
              : 0,
        }))
        .sort((a, b) => b.growth - a.growth)
        .slice(0, 15);

      data = {
        engagement: categoryEngagement,
        quality: categoryQuality,
        growth: categoryGrowthData,
        duplicates: categoryDuplicates,
        sourceDiversity: categorySourceDiversity,
      };

      console.log("✅ Categories complete");
    }

    // ==================== SOURCES ANALYTICS ====================
    else if (type === "sources") {
      console.log("⏳ Fetching sources...");

      const [
        topSources,
        sourceReliability,
        sourceConsistency,
        sourceCategorySpread,
        sourceDuplicateBehavior,
      ] = await Promise.all([
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
                highQuality: {
                  $sum: { $cond: [{ $gte: ["$score", 70] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                source: "$_id",
                count: 1,
                avgScore: { $round: ["$avgScore", 2] },
                totalViews: 1,
                totalLikes: 1,
                qualityRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$highQuality", "$count"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            {
              $group: {
                _id: {
                  source: "$source",
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                },
                dailyCount: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.source",
                avgDailyArticles: { $avg: "$dailyCount" },
                daysActive: { $sum: 1 },
              },
            },
            {
              $project: {
                source: "$_id",
                avgDailyArticles: { $round: ["$avgDailyArticles", 2] },
                daysActive: 1,
                _id: 0,
              },
            },
            { $sort: { avgDailyArticles: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            { $match: { score: { $ne: null } } },
            {
              $group: {
                _id: "$source",
                avgScore: { $avg: "$score" },
                stdDevScore: { $stdDevPop: "$score" },
                count: { $sum: 1 },
              },
            },
            { $match: { count: { $gte: 10 } } },
            {
              $project: {
                source: "$_id",
                avgScore: { $round: ["$avgScore", 2] },
                consistency: {
                  $round: [
                    { $subtract: [100, { $multiply: ["$stdDevScore", 2] }] },
                    2,
                  ],
                },
                count: 1,
                _id: 0,
              },
            },
            { $sort: { consistency: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            {
              $group: {
                _id: {
                  source: "$source",
                  category: "$category",
                },
              },
            },
            {
              $group: {
                _id: "$_id.source",
                categories: { $sum: 1 },
              },
            },
            {
              $project: {
                source: "$_id",
                categories: 1,
                _id: 0,
              },
            },
            { $sort: { categories: -1 } },
            { $limit: 15 },
          ])
          .toArray(),

        db
          .collection("newsmap")
          .aggregate([
            { $sample: { size: 1000 } },
            { $unwind: "$sources" },
            {
              $group: {
                _id: "$sources",
                duplicateGroups: { $sum: 1 },
                totalDuplicates: { $sum: "$count" },
              },
            },
            {
              $project: {
                source: "$_id",
                duplicateGroups: 1,
                totalDuplicates: 1,
                _id: 0,
              },
            },
            { $sort: { duplicateGroups: -1 } },
            { $limit: 15 },
          ])
          .toArray(),
      ]);

      data = {
        topSources,
        reliability: sourceReliability,
        consistency: sourceConsistency,
        categorySpread: sourceCategorySpread,
        duplicateBehavior: sourceDuplicateBehavior,
      };

      console.log("✅ Sources complete");
    }

    // ==================== ENGAGEMENT ANALYTICS ====================
    else if (type === "engagement") {
      console.log("⏳ Fetching engagement...");

      const [
        overallEngagement,
        engagementByScore,
        viralityMetrics,
        engagementTrend,
      ] = await Promise.all([
        db
          .collection("news")
          .aggregate([
            {
              $group: {
                _id: null,
                totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                totalAI: { $sum: { $ifNull: ["$aiGenerationsCount", 0] } },
                totalArticles: { $sum: 1 },
                articlesWithViews: {
                  $sum: { $cond: [{ $gt: ["$viewsCount", 0] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                totalViews: 1,
                totalLikes: 1,
                totalAI: 1,
                avgViewsPerArticle: {
                  $round: [{ $divide: ["$totalViews", "$totalArticles"] }, 2],
                },
                viewRate: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ["$articlesWithViews", "$totalArticles"] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                engagementRate: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$totalLikes",
                            { $add: ["$totalViews", 1] },
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            { $match: { score: { $ne: null } } },
            { $sample: { size: 5000 } },
            {
              $bucket: {
                groupBy: "$score",
                boundaries: [0, 25, 50, 75, 100],
                default: "Other",
                output: {
                  count: { $sum: 1 },
                  totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                  totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                  avgViews: { $avg: { $ifNull: ["$viewsCount", 0] } },
                },
              },
            },
            {
              $project: {
                scoreRange: {
                  $concat: [
                    { $toString: "$_id" },
                    "-",
                    { $toString: { $add: ["$_id", 25] } },
                  ],
                },
                count: 1,
                totalViews: 1,
                totalLikes: 1,
                avgViews: { $round: ["$avgViews", 2] },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("news")
          .aggregate([
            {
              $match: {
                $or: [
                  { viewsCount: { $gt: 100 } },
                  { likesCount: { $gt: 10 } },
                ],
              },
            },
            {
              $group: {
                _id: null,
                viralArticles: { $sum: 1 },
                totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                maxViews: { $max: { $ifNull: ["$viewsCount", 0] } },
                maxLikes: { $max: { $ifNull: ["$likesCount", 0] } },
              },
            },
          ])
          .toArray(),

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
                totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                totalViews: 1,
                totalLikes: 1,
                avgViews: {
                  $round: [{ $divide: ["$totalViews", "$count"] }, 2],
                },
                _id: 0,
              },
            },
          ])
          .toArray(),
      ]);

      data = {
        overall: overallEngagement[0] || {},
        byScore: engagementByScore,
        virality: viralityMetrics[0] || {},
        trend: engagementTrend,
      };

      console.log("✅ Engagement complete");
    }

    // ==================== FETCH PERFORMANCE ====================
    else if (type === "fetch-performance") {
      console.log("⏳ Fetching performance...");

      const [
        gnewsStats,
        gnewsByCategory,
        rssStats,
        rssByCategory,
        reliabilityTrend,
      ] = await Promise.all([
        db
          .collection("gnews_logs")
          .aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: {
                    $cond: [
                      { $eq: [{ $ifNull: ["$error", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
              },
            },
            {
              $project: {
                total: 1,
                successful: 1,
                failed: { $subtract: ["$total", "$successful"] },
                totalArticles: 1,
                avgArticlesPerRequest: {
                  $round: [{ $divide: ["$totalArticles", "$total"] }, 2],
                },
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("gnews_logs")
          .aggregate([
            {
              $group: {
                _id: "$category",
                total: { $sum: 1 },
                successful: {
                  $sum: {
                    $cond: [
                      { $eq: [{ $ifNull: ["$error", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
              },
            },
            {
              $project: {
                category: "$_id",
                total: 1,
                successful: 1,
                totalArticles: 1,
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
            { $sort: { totalArticles: -1 } },
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
                  $sum: {
                    $cond: [
                      { $eq: [{ $ifNull: ["$error", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
              },
            },
            {
              $project: {
                total: 1,
                successful: 1,
                failed: { $subtract: ["$total", "$successful"] },
                totalArticles: 1,
                avgArticlesPerRequest: {
                  $round: [{ $divide: ["$totalArticles", "$total"] }, 2],
                },
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
          ])
          .toArray(),

        db
          .collection("rss_logs")
          .aggregate([
            {
              $group: {
                _id: "$category",
                total: { $sum: 1 },
                successful: {
                  $sum: {
                    $cond: [
                      { $eq: [{ $ifNull: ["$error", null] }, null] },
                      1,
                      0,
                    ],
                  },
                },
                totalArticles: { $sum: { $ifNull: ["$articles_count", 0] } },
              },
            },
            {
              $project: {
                category: "$_id",
                total: 1,
                successful: 1,
                totalArticles: 1,
                successRate: {
                  $round: [
                    {
                      $multiply: [{ $divide: ["$successful", "$total"] }, 100],
                    },
                    2,
                  ],
                },
                _id: 0,
              },
            },
            { $sort: { totalArticles: -1 } },
          ])
          .toArray(),

        Promise.all([
          db
            .collection("gnews_logs")
            .aggregate([
              {
                $match: {
                  timestamp: {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                  },
                  total: { $sum: 1 },
                  successful: {
                    $sum: { $cond: [{ $eq: ["$error", null] }, 1, 0] },
                  },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  date: "$_id",
                  source: { $literal: "GNews" },
                  successRate: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$successful", "$total"] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  _id: 0,
                },
              },
            ])
            .toArray(),

          db
            .collection("rss_logs")
            .aggregate([
              {
                $match: {
                  timestamp: {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                  },
                  total: { $sum: 1 },
                  successful: {
                    $sum: { $cond: [{ $eq: ["$error", null] }, 1, 0] },
                  },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  date: "$_id",
                  source: { $literal: "RSS" },
                  successRate: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$successful", "$total"] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  _id: 0,
                },
              },
            ])
            .toArray(),
        ]).then((results) => [...results[0], ...results[1]]),
      ]);

      const gnewsData = gnewsStats[0] || {
        total: 0,
        successful: 0,
        failed: 0,
        totalArticles: 0,
        avgArticlesPerRequest: 0,
        successRate: 0,
      };
      const rssData = rssStats[0] || {
        total: 0,
        successful: 0,
        failed: 0,
        totalArticles: 0,
        avgArticlesPerRequest: 0,
        successRate: 0,
      };

      const totalFetchRequests = gnewsData.total + rssData.total;
      const totalSuccessful = gnewsData.successful + rssData.successful;
      const overallSuccessRate =
        totalFetchRequests > 0
          ? parseFloat(
              ((totalSuccessful / totalFetchRequests) * 100).toFixed(2)
            )
          : 0;

      data = {
        gnews: gnewsData,
        rss: rssData,
        overallSuccessRate,
        gnewsByCategory,
        rssByCategory,
        reliabilityTrend,
      };

      console.log("✅ Fetch performance complete");
    }

    // ==================== DUPLICATES - OPTIMIZED ====================
    else if (type === "duplicates") {
      console.log("⏳ Fetching duplicates...");

      const [overall, byCategory, bySource, mostDuplicated] = await Promise.all(
        [
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
                },
              },
            ])
            .toArray(),

          db
            .collection("newsmap")
            .aggregate([
              { $sample: { size: 1000 } },
              { $unwind: "$sources" },
              {
                $group: {
                  _id: "$sources",
                  duplicateGroups: { $sum: 1 },
                  totalDuplicates: { $sum: "$count" },
                },
              },
              { $sort: { totalDuplicates: -1 } },
              { $limit: 15 },
            ])
            .toArray(),

          db
            .collection("newsmap")
            .aggregate([
              { $sample: { size: 1000 } },
              { $unwind: "$sources" },
              {
                $group: {
                  _id: "$sources",
                  duplicateGroups: { $sum: 1 },
                  totalDuplicates: { $sum: "$count" },
                },
              },
              { $sort: { duplicateGroups: -1 } },
              { $limit: 15 },
            ])
            .toArray(),

          db
            .collection("newsmap")
            .aggregate([
              { $sort: { count: -1 } },
              { $limit: 15 },
              {
                $project: {
                  title: { $literal: "Duplicate Content" },
                  category: { $literal: "general" },
                  duplicateCount: "$count",
                  sources: 1,
                  sourceCount: { $size: "$sources" },
                  firstSeen: 1,
                  lastSeen: 1,
                  viralityIndex: { $multiply: ["$count", 10] },
                },
              },
            ])
            .toArray(),
        ]
      );

      data = {
        overall: overall[0] || {
          totalGroups: 0,
          totalDuplicates: 0,
          avgDuplicatesPerGroup: 0,
          maxDuplicates: 0,
        },
        byCategory: byCategory.map((item) => ({
          category: item._id || "Unknown",
          ...item,
          _id: undefined,
        })),
        bySource: bySource.map((item) => ({
          source: item._id,
          ...item,
          _id: undefined,
        })),
        mostDuplicated: mostDuplicated,
        timeSpread: [],
        qualityCorrelation: [],
        sourceNetwork: [],
        categoryHeatmap: [],
      };

      console.log("✅ Duplicates complete");
    }

    // ==================== CORRELATIONS - SIMPLIFIED & WORKING ====================
    else if (type === "correlations") {
      console.log("⏳ Fetching correlations...");

      try {
        const [
          scoreEngagement,
          timeQuality,
          categorySource,
          sourceReliability,
        ] = await Promise.all([
          // Score vs Engagement - Simplified
          db
            .collection("news")
            .aggregate([
              {
                $match: {
                  score: { $exists: true, $ne: null, $gte: 0 },
                  viewsCount: { $exists: true, $gte: 0 },
                },
              },
              { $sample: { size: 2000 } },
              {
                $bucket: {
                  groupBy: "$score",
                  boundaries: [0, 20, 40, 60, 80, 100],
                  default: "Other",
                  output: {
                    count: { $sum: 1 },
                    totalViews: { $sum: "$viewsCount" },
                    totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
                  },
                },
              },
              {
                $project: {
                  scoreRange: {
                    $concat: [
                      { $toString: "$_id" },
                      "-",
                      { $toString: { $add: ["$_id", 20] } },
                    ],
                  },
                  count: 1,
                  avgViews: {
                    $round: [{ $divide: ["$totalViews", "$count"] }, 2],
                  },
                  avgLikes: {
                    $round: [{ $divide: ["$totalLikes", "$count"] }, 2],
                  },
                  engagementIndex: {
                    $round: [
                      {
                        $divide: [
                          {
                            $add: [
                              "$totalViews",
                              { $multiply: ["$totalLikes", 3] },
                            ],
                          },
                          "$count",
                        ],
                      },
                      2,
                    ],
                  },
                  _id: 0,
                },
              },
            ])
            .toArray()
            .catch((err) => {
              console.error("Score engagement error:", err);
              return [];
            }),

          // Time vs Quality - Simplified
          db
            .collection("news")
            .aggregate([
              {
                $match: {
                  score: { $exists: true, $ne: null },
                  createdAt: {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              { $sample: { size: 2000 } },
              {
                $project: {
                  hour: {
                    $hour: {
                      date: "$createdAt",
                      timezone: "UTC",
                    },
                  },
                  dayOfWeek: { $dayOfWeek: "$createdAt" },
                  score: 1,
                  viewsCount: { $ifNull: ["$viewsCount", 0] },
                },
              },
              {
                $group: {
                  _id: {
                    hour: "$hour",
                    dayOfWeek: "$dayOfWeek",
                  },
                  avgScore: { $avg: "$score" },
                  avgViews: { $avg: "$viewsCount" },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  hour: "$_id.hour",
                  dayOfWeek: {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: ["$_id.dayOfWeek", 1] },
                          then: "Sunday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 2] },
                          then: "Monday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 3] },
                          then: "Tuesday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 4] },
                          then: "Wednesday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 5] },
                          then: "Thursday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 6] },
                          then: "Friday",
                        },
                        {
                          case: { $eq: ["$_id.dayOfWeek", 7] },
                          then: "Saturday",
                        },
                      ],
                      default: "Unknown",
                    },
                  },
                  avgScore: { $round: ["$avgScore", 2] },
                  avgViews: { $round: ["$avgViews", 2] },
                  avgHotness: 0,
                  count: 1,
                  _id: 0,
                },
              },
              { $sort: { avgScore: -1 } },
              { $limit: 20 },
            ])
            .toArray()
            .catch((err) => {
              console.error("Time quality error:", err);
              return [];
            }),

          // Category-Source Matrix - Simplified
          db
            .collection("news")
            .aggregate([
              {
                $match: {
                  createdAt: { $gte: startDate },
                  category: { $exists: true, $ne: null },
                  source: { $exists: true, $ne: null },
                },
              },
              { $sample: { size: 3000 } },
              {
                $group: {
                  _id: {
                    category: "$category",
                    source: "$source",
                  },
                  count: { $sum: 1 },
                  totalScore: { $sum: { $ifNull: ["$score", 0] } },
                  totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                },
              },
              { $match: { count: { $gte: 3 } } },
              {
                $project: {
                  category: "$_id.category",
                  source: "$_id.source",
                  count: 1,
                  avgScore: {
                    $round: [{ $divide: ["$totalScore", "$count"] }, 2],
                  },
                  avgViews: {
                    $round: [{ $divide: ["$totalViews", "$count"] }, 2],
                  },
                  dominanceScore: {
                    $round: [
                      {
                        $multiply: [
                          "$count",
                          { $divide: ["$totalScore", "$count"] },
                        ],
                      },
                      2,
                    ],
                  },
                  _id: 0,
                },
              },
              { $sort: { dominanceScore: -1 } },
              { $limit: 25 },
            ])
            .toArray()
            .catch((err) => {
              console.error("Category source error:", err);
              return [];
            }),

          // Source Reliability - Simplified
          db
            .collection("news")
            .aggregate([
              {
                $match: {
                  score: { $exists: true, $ne: null },
                  source: { $exists: true, $ne: null },
                  createdAt: { $gte: startDate },
                },
              },
              { $sample: { size: 3000 } },
              {
                $group: {
                  _id: "$source",
                  count: { $sum: 1 },
                  totalScore: { $sum: "$score" },
                  totalViews: { $sum: { $ifNull: ["$viewsCount", 0] } },
                  totalHotness: { $sum: { $ifNull: ["$hotness", 0] } },
                },
              },
              { $match: { count: { $gte: 5 } } },
              {
                $project: {
                  source: "$_id",
                  count: 1,
                  avgScore: {
                    $round: [{ $divide: ["$totalScore", "$count"] }, 2],
                  },
                  avgViews: {
                    $round: [{ $divide: ["$totalViews", "$count"] }, 2],
                  },
                  avgHotness: {
                    $round: [{ $divide: ["$totalHotness", "$count"] }, 2],
                  },
                  consistency: 85,
                  reliabilityIndex: {
                    $round: [
                      {
                        $multiply: [{ $divide: ["$totalScore", "$count"] }, 85],
                      },
                      2,
                    ],
                  },
                  _id: 0,
                },
              },
              { $sort: { reliabilityIndex: -1 } },
              { $limit: 20 },
            ])
            .toArray()
            .catch((err) => {
              console.error("Source reliability error:", err);
              return [];
            }),
        ]);

        data = {
          scoreEngagement: scoreEngagement || [],
          timeQuality: timeQuality || [],
          categorySourceMatrix: categorySource || [],
          sourceReliability: sourceReliability || [],
          duplicateEngagement: [],
          categoryTimeDistribution: [],
          fetchQuality: { gnews: [], rss: [] },
        };

        console.log("✅ Correlations complete:", {
          scoreEngagement: scoreEngagement.length,
          timeQuality: timeQuality.length,
          categorySource: categorySource.length,
          sourceReliability: sourceReliability.length,
        });
      } catch (error) {
        console.error("❌ Correlation section error:", error.message);
        console.error("Error stack:", error.stack);

        // Return empty data structure instead of failing
        data = {
          scoreEngagement: [],
          timeQuality: [],
          categorySourceMatrix: [],
          sourceReliability: [],
          duplicateEngagement: [],
          categoryTimeDistribution: [],
          fetchQuality: { gnews: [], rss: [] },
        };
      }
    }

    console.log(`✅ Analytics complete for ${type}`);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // console.error(`❌ Analytics API Error (${type}):`, error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics",
        type: type,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
