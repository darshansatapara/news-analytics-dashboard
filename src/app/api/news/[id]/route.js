import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    console.log("🔍 API Route Hit - News Detail");
    console.log("📋 Params:", params);

    const db = await getDatabase();
    const { id } = await params; // Important: await params in Next.js 15+

    console.log("🆔 Article ID:", id);

    // Check both field names (articleId and article_id) for compatibility
    const article = await db.collection("news").findOne({
      $or: [{ articleId: id }, { article_id: id }],
    });

    console.log("📰 Article found:", article ? "YES" : "NO");

    if (!article) {
      console.log("❌ Article not found for ID:", id);

      // Debug: Check what articleIds exist
      const sampleArticles = await db
        .collection("news")
        .find({})
        .limit(5)
        .project({ articleId: 1, article_id: 1, title: 1 })
        .toArray();

      console.log("📊 Sample articles in database:", sampleArticles);

      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
          debug: {
            searchedId: id,
            sampleArticles: sampleArticles,
          },
        },
        { status: 404 }
      );
    }

    // Increment view count
    const updateQuery = article.articleId
      ? { articleId: article.articleId }
      : { article_id: article.article_id };

    await db.collection("news").updateOne(updateQuery, {
      $inc: { viewsCount: 1 },
      $set: { updatedAt: new Date() },
    });

    // Get related articles (same category, different article)
    const relatedArticles = await db
      .collection("news")
      .find({
        category: article.category,
        $or: [{ articleId: { $ne: id } }, { article_id: { $ne: id } }],
      })
      .sort({ score: -1 })
      .limit(6)
      .project({
        title: 1,
        source: 1,
        imageUrl: 1,
        image_url: 1,
        publishedAt: 1,
        published_at: 1,
        articleId: 1,
        article_id: 1,
        category: 1,
      })
      .toArray();

    console.log("✅ Related articles found:", relatedArticles.length);

    return NextResponse.json({
      success: true,
      data: {
        article: {
          ...article,
          viewsCount: (article.viewsCount || 0) + 1,
          // Normalize field names for frontend
          articleId: article.articleId || article.article_id,
          imageUrl: article.imageUrl || article.image_url,
          publishedAt: article.publishedAt || article.published_at,
        },
        relatedArticles: relatedArticles.map((a) => ({
          ...a,
          articleId: a.articleId || a.article_id,
          imageUrl: a.imageUrl || a.image_url,
          publishedAt: a.publishedAt || a.published_at,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Article Detail API Error:", error);
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

export async function PATCH(request, { params }) {
  try {
    const db = await getDatabase();
    const { id } = await params; // Important: await params in Next.js 15+
    const body = await request.json();
    const { action } = body;

    console.log("🔄 PATCH request:", { id, action });

    if (!action || !["like", "aiGeneration"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "like" or "aiGeneration"',
        },
        { status: 400 }
      );
    }

    const updateField = action === "like" ? "likesCount" : "aiGenerationsCount";

    // Check both field names
    const result = await db.collection("news").findOneAndUpdate(
      {
        $or: [{ articleId: id }, { article_id: id }],
      },
      {
        $inc: { [updateField]: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        articleId: result.articleId || result.article_id,
        imageUrl: result.imageUrl || result.image_url,
        publishedAt: result.publishedAt || result.published_at,
      },
      message: `${
        action === "like" ? "Liked" : "AI generation counted"
      } successfully`,
    });
  } catch (error) {
    console.error("❌ Article Update API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
