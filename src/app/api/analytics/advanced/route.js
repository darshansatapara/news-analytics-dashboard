import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get("type") || "all";

    const analytics = {};

    // Time-based Analysis
    if (analysisType === "all" || analysisType === "time") {
      analytics.timeAnalysis = await db
        .collection("news")
        .aggregate([
          {
            $group: {
              _id: {
                hour: { $hour: "$publishedAt" },
                dayOfWeek: { $dayOfWeek: "$publishedAt" },
              },
              count: { $sum: 1 },
              avgScore: { $avg: "$score" },
            },
          },
          { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
        ])
        .toArray();
    }

    // Source Quality Analysis
    if (analysisType === "all" || analysisType === "quality") {
      analytics.sourceQuality = await db
        .collection("news")
        .aggregate([
          {
            $group: {
              _id: "$source",
              totalArticles: { $sum: 1 },
              avgScore: { $avg: "$score" },
              avgHotness: { $avg: "$hotness" },
              totalViews: { $sum: "$viewsCount" },
              totalLikes: { $sum: "$likesCount" },
              avgEngagement: {
                $avg: {
                  $add: ["$viewsCount", "$likesCount", "$aiGenerationsCount"],
                },
              },
            },
          },
          { $sort: { avgScore: -1 } },
          { $limit: 50 },
        ])
        .toArray();
    }

    // Category Performance Over Time
    if (analysisType === "all" || analysisType === "performance") {
      analytics.categoryPerformance = await db
        .collection("news")
        .aggregate([
          {
            $group: {
              _id: {
                category: "$category",
                date: "$date",
              },
              count: { $sum: 1 },
              avgScore: { $avg: "$score" },
              avgHotness: { $avg: "$hotness" },
              totalEngagement: {
                $sum: {
                  $add: ["$viewsCount", "$likesCount", "$aiGenerationsCount"],
                },
              },
            },
          },
          { $sort: { "_id.date": -1 } },
          { $limit: 200 },
        ])
        .toArray();
    }

    // Tag Analysis
    if (analysisType === "all" || analysisType === "tags") {
      analytics.tagAnalysis = await db
        .collection("news")
        .aggregate([
          { $unwind: "$tags" },
          {
            $group: {
              _id: "$tags",
              count: { $sum: 1 },
              avgScore: { $avg: "$score" },
              categories: { $addToSet: "$category" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ])
        .toArray();
    }

    // Content Length Analysis
    if (analysisType === "all" || analysisType === "content") {
      analytics.contentAnalysis = await db
        .collection("news")
        .aggregate([
          {
            $project: {
              titleLength: { $strLenCP: { $ifNull: ["$title", ""] } },
              descLength: { $strLenCP: { $ifNull: ["$description", ""] } },
              score: 1,
              viewsCount: 1,
              category: 1,
            },
          },
          {
            $bucket: {
              groupBy: "$titleLength",
              boundaries: [0, 50, 100, 150, 200, 500],
              default: "Long",
              output: {
                count: { $sum: 1 },
                avgScore: { $avg: "$score" },
                avgViews: { $avg: "$viewsCount" },
              },
            },
          },
        ])
        .toArray();
    }

    // Duplicate Patterns
    if (analysisType === "all" || analysisType === "duplicates") {
      analytics.duplicatePatterns = await db
        .collection("newsmap")
        .aggregate([
          {
            $project: {
              count: 1,
              sources: 1,
              sourceCount: { $size: "$sources" },
              timeDiff: {
                $subtract: ["$lastSeen", "$firstSeen"],
              },
            },
          },
          {
            $group: {
              _id: {
                duplicateCount: "$count",
                sourceCount: "$sourceCount",
              },
              occurrences: { $sum: 1 },
              avgTimeDiff: { $avg: "$timeDiff" },
            },
          },
          { $sort: { occurrences: -1 } },
        ])
        .toArray();
    }

    // Engagement Correlation
    if (analysisType === "all" || analysisType === "engagement") {
      analytics.engagementCorrelation = await db
        .collection("news")
        .aggregate([
          {
            $match: {
              score: { $ne: null },
              viewsCount: { $gt: 0 },
            },
          },
          {
            $bucket: {
              groupBy: "$score",
              boundaries: [0, 20, 40, 60, 80, 100],
              default: "Other",
              output: {
                count: { $sum: 1 },
                avgViews: { $avg: "$viewsCount" },
                avgLikes: { $avg: "$likesCount" },
                avgAIGen: { $avg: "$aiGenerationsCount" },
                totalEngagement: {
                  $sum: {
                    $add: ["$viewsCount", "$likesCount", "$aiGenerationsCount"],
                  },
                },
              },
            },
          },
        ])
        .toArray();
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Advanced Analytics API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
