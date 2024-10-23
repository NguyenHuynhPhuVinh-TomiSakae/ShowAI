import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export async function GET() {
    try {
        const smStream = new SitemapStream({
            hostname: `https://${process.env.VERCEL_URL || 'showai.vercel.app'}`
        });

        // Add URLs to the sitemap
        smStream.write({ url: '/', changefreq: 'daily', priority: 1 });
        smStream.write({ url: '/search', changefreq: 'daily', priority: 0.8 });
        smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.5 });
        smStream.write({ url: '/leaderboard', changefreq: 'daily', priority: 0.7 });
        smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.5 });
        smStream.write({ url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 });
        smStream.write({ url: '/login', changefreq: 'monthly', priority: 0.6 });
        smStream.write({ url: '/account', changefreq: 'weekly', priority: 0.6 });
        smStream.write({ url: '/show', changefreq: 'daily', priority: 0.8 });
        smStream.write({ url: '/codebox', changefreq: 'daily', priority: 0.8 });
        smStream.write({ url: '/chatbox', changefreq: 'daily', priority: 0.8 });
        smStream.write({ url: '/games', changefreq: 'daily', priority: 0.8 });

        smStream.end();

        const sitemapOutput = await streamToPromise(smStream);

        return new NextResponse(sitemapOutput, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (e) {
        console.error(e);
        return new NextResponse('Server Error', { status: 500 });
    }
}
