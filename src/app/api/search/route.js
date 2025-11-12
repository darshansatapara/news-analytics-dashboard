import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, news, sources, categories

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Query must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    const results = {};

    // Search news articles
    if (type === "all" || type === "news") {
      results.articles = await db
        .collection("news")
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { source: { $regex: query, $options: "i" } },
          ],
        })
        .limit(10)
        .project({
          title: 1,
          source: 1,
          category: 1,
          publishedAt: 1,
          imageUrl: 1,
          articleId: 1,
        })
        .toArray();
    }

    // Search sources
    if (type === "all" || type === "sources") {
      const sources = await db.collection("news").distinct("source", {
        source: { $regex: query, $options: "i" },
      });
      results.sources = sources.slice(0, 10);
    }

    // Search categories
    if (type === "all" || type === "categories") {
      const categories = await db.collection("news").distinct("category", {
        category: { $regex: query, $options: "i" },
      });
      results.categories = categories.slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
