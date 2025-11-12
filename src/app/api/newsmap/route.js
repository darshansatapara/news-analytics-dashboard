import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const minDuplicates = parseInt(searchParams.get("minDuplicates") || "2");
    const sortBy = searchParams.get("sortBy") || "count";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build match query
    const matchQuery = {
      count: { $gte: minDuplicates },
    };

    // Execute queries in parallel for better performance
    const [newsmapData, total, stats] = await Promise.all([
      // Get newsmap entries with enriched article data
      db
        .collection("newsmap")
        .aggregate([
          { $match: matchQuery },
          { $sort: { [sortBy]: sortOrder, lastSeen: -1 } },
          { $skip: skip },
          { $limit: limit },
          // Lookup to get full article details
          {
            $lookup: {
              from: "news",
              let: { articleIds: "$articleIds" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $in: ["$articleId", "$$articleIds"] },
                        { $in: ["$article_id", "$$articleIds"] },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    title: 1,
                    source: 1,
                    category: 1,
                    publishedAt: 1,
                    published_at: 1,
                    imageUrl: 1,
                    image_url: 1,
                    articleId: 1,
                    article_id: 1,
                  },
                },
              ],
              as: "articles",
            },
          },
          // Add computed fields
          {
            $addFields: {
              // Normalize article fields
              articles: {
                $map: {
                  input: "$articles",
                  as: "article",
                  in: {
                    _id: "$$article._id",
                    title: "$$article.title",
                    source: "$$article.source",
                    category: "$$article.category",
                    publishedAt: {
                      $ifNull: [
                        "$$article.publishedAt",
                        "$$article.published_at",
                      ],
                    },
                    imageUrl: {
                      $ifNull: ["$$article.imageUrl", "$$article.image_url"],
                    },
                    articleId: {
                      $ifNull: ["$$article.articleId", "$$article.article_id"],
                    },
                  },
                },
              },
            },
          },
        ])
        .toArray(),

      // Get accurate count
      db.collection("newsmap").countDocuments(matchQuery),

      // Calculate comprehensive statistics
      db
        .collection("newsmap")
        .aggregate([
          {
            $facet: {
              // Basic stats
              basicStats: [
                {
                  $group: {
                    _id: null,
                    totalGroups: { $sum: 1 },
                    totalDuplicates: { $sum: "$count" },
                    avgDuplicatesPerGroup: { $avg: "$count" },
                    maxDuplicates: { $max: "$count" },
                    minDuplicates: { $min: "$count" },
                  },
                },
              ],
              // Distribution by duplicate count
              distribution: [
                {
                  $bucket: {
                    groupBy: "$count",
                    boundaries: [2, 5, 10, 20, 50, 100],
                    default: "100+",
                    output: {
                      count: { $sum: 1 },
                      totalArticles: { $sum: "$count" },
                    },
                  },
                },
              ],
              // Top duplicate sources
              topSources: [
                { $unwind: "$sources" },
                {
                  $group: {
                    _id: "$sources",
                    duplicateCount: { $sum: 1 },
                    totalArticles: { $sum: "$count" },
                  },
                },
                { $sort: { duplicateCount: -1 } },
                { $limit: 10 },
              ],
              // Time-based analysis
              timeAnalysis: [
                {
                  $project: {
                    timeDiff: {
                      $subtract: ["$lastSeen", "$firstSeen"],
                    },
                    count: 1,
                  },
                },
                {
                  $group: {
                    _id: null,
                    avgTimeDiff: { $avg: "$timeDiff" },
                    maxTimeDiff: { $max: "$timeDiff" },
                    minTimeDiff: { $min: "$timeDiff" },
                  },
                },
              ],
            },
          },
        ])
        .toArray(),
    ]);

    // Format statistics
    const formattedStats = {
      ...stats[0].basicStats[0],
      distribution: stats[0].distribution.map((bucket) => ({
        range:
          bucket._id === "100+" ? "100+" : `${bucket._id}-${bucket._id + 5}`,
        groupCount: bucket.count,
        totalArticles: bucket.totalArticles,
      })),
      topSources: stats[0].topSources,
      timeAnalysis: {
        avgTimeDiffHours: stats[0].timeAnalysis[0]?.avgTimeDiff
          ? (stats[0].timeAnalysis[0].avgTimeDiff / (1000 * 60 * 60)).toFixed(2)
          : 0,
        maxTimeDiffHours: stats[0].timeAnalysis[0]?.maxTimeDiff
          ? (stats[0].timeAnalysis[0].maxTimeDiff / (1000 * 60 * 60)).toFixed(2)
          : 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        newsmap: newsmapData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        stats: formattedStats,
      },
    });
  } catch (error) {
    console.error("NewsMap API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
