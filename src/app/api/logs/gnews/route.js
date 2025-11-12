import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const hasError = searchParams.get('hasError');

    // Build query
    const query = {};
    if (category) query.category = category;
    if (hasError === 'true') query.error = { $ne: null };
    if (hasError === 'false') query.error = null;

    // Get logs and analytics
    const [logs, total, analytics] = await Promise.all([
      db.collection('gnews_logs')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      
      db.collection('gnews_logs').countDocuments(query),
      
      db.collection('gnews_logs').aggregate([
        {
          $facet: {
            successRate: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  successful: {
                    $sum: { $cond: [{ $eq: ['$error', null] }, 1, 0] }
                  },
                  failed: {
                    $sum: { $cond: [{ $ne: ['$error', null] }, 1, 0] }
                  },
                  totalArticles: { $sum: '$articles_count' }
                }
              }
            ],
            byCategory: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  totalArticles: { $sum: '$articles_count' },
                  errors: {
                    $sum: { $cond: [{ $ne: ['$error', null] }, 1, 0] }
                  }
                }
              },
              { $sort: { totalArticles: -1 } }
            ],
            byCountry: [
              {
                $group: {
                  _id: '$country',
                  count: { $sum: 1 },
                  totalArticles: { $sum: '$articles_count' }
                }
              },
              { $sort: { totalArticles: -1 } }
            ],
            timeline: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                  },
                  requests: { $sum: 1 },
                  articles: { $sum: '$articles_count' },
                  errors: {
                    $sum: { $cond: [{ $ne: ['$error', null] }, 1, 0] }
                  }
                }
              },
              { $sort: { _id: -1 } },
              { $limit: 30 }
            ]
          }
        }
      ]).toArray()
    ]);

    const analyticsData = analytics[0];
    const successRateData = analyticsData.successRate[0] || {};
    const successRate = successRateData.total > 0 
      ? ((successRateData.successful / successRateData.total) * 100).toFixed(2)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        analytics: {
          successRate: parseFloat(successRate),
          totalRequests: successRateData.total || 0,
          successful: successRateData.successful || 0,
          failed: successRateData.failed || 0,
          totalArticlesFetched: successRateData.totalArticles || 0,
          byCategory: analyticsData.byCategory,
          byCountry: analyticsData.byCountry,
          timeline: analyticsData.timeline
        }
      }
    });

  } catch (error) {
    console.error('GNews Logs API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
