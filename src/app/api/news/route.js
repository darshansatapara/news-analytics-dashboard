import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    console.log("🔍 News List API Hit");

    const db = await getDatabase();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const minHotness = searchParams.get("minHotness");
    const maxHotness = searchParams.get("maxHotness");
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    console.log("📋 Query Params:", {
      page,
      limit,
      category,
      source,
      search,
      sortBy,
      sortOrder,
    });

    // Build query
    const query = {};

    if (category) query.category = category;
    if (source) query.source = source;

    // Date range filter
    if (dateFrom || dateTo) {
      query.$or = [{ publishedAt: {} }, { published_at: {} }];

      if (dateFrom) {
        query.$or[0].publishedAt.$gte = new Date(dateFrom);
        query.$or[1].published_at.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.$or[0].publishedAt.$lte = endDate;
        query.$or[1].published_at.$lte = endDate;
      }
    }

    // Score range filter
    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = parseInt(minScore);
      if (maxScore) query.score.$lte = parseInt(maxScore);
    }

    // Hotness range filter
    if (minHotness || maxHotness) {
      query.hotness = {};
      if (minHotness) query.hotness.$gte = parseInt(minHotness);
      if (maxHotness) query.hotness.$lte = parseInt(maxHotness);
    }

    // Search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { source: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      });
    }

    console.log("🔎 MongoDB Query:", JSON.stringify(query));

    // Determine sort field
    const sortField = sortBy;

    // Execute queries in parallel
    const [articles, total, categories, sources] = await Promise.all([
      db
        .collection("news")
        .find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray(),

      db.collection("news").countDocuments(query),

      db.collection("news").distinct("category"),

      db.collection("news").distinct("source"),
    ]);

    console.log("✅ Found articles:", articles.length);
    console.log("📊 Total count:", total);

    // Normalize field names for frontend
    const normalizedArticles = articles.map((article) => ({
      ...article,
      articleId: article.articleId || article.article_id,
      imageUrl: article.imageUrl || article.image_url,
      publishedAt: article.publishedAt || article.published_at,
      fetchedAt: article.fetchedAt || article.fetched_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        articles: normalizedArticles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          categories: categories.filter(Boolean).sort(),
          sources: sources.filter(Boolean).sort(),
        },
      },
    });
  } catch (error) {
    console.error("❌ News API Error:", error);
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
