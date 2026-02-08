import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { owner, repo, number } = req.query;

    if (!owner || !repo || !number) {
        return res.status(400).json({ error: 'Missing owner, repo, or PR number' });
    }

    // Cache for 1 hour (public data, doesn't change often)
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    try {
        // 1. Fetch PR details (Status: merged/closed/open)
        const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`, {
            headers: {
                'User-Agent': '0x1a-Portfolio',
                // Optional: Add GITHUB_TOKEN here if rate limits are hit
                // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });

        if (!prResponse.ok) {
            throw new Error(`GitHub API Error: ${prResponse.statusText}`);
        }

        const prData = await prResponse.json();

        let status = 'open';
        if (prData.merged) status = 'merged';
        else if (prData.state === 'closed') status = 'closed';

        // 2. Fetch Repo details (for Social Image)
        // GitHub usually has `og:image` in `open_graph_image_url` on the repo object or we can scrape it
        // A reliable way for public repos is: https://opengraph.githubassets.com/1/<owner>/<repo>
        // But let's check if the API gives us `owner.avatar_url` or if we can use the social card.

        // The standard GitHub social preview card format:
        // https://opengraph.githubassets.com/<random_id>/<owner>/<repo>/pull/<number>
        // Actually, for PRs specifically: https://opengraph.githubassets.com/1/<owner>/<repo>/pull/<number> works reliably!

        const imageUrl = `https://opengraph.githubassets.com/1/${owner}/${repo}/pull/${number}`;

        return res.status(200).json({
            status,
            title: prData.title,
            url: prData.html_url,
            image: imageUrl,
            repo: `${owner}/${repo}`,
            author: prData.user.login,
            createdAt: prData.created_at,
            mergedAt: prData.merged_at
        });

    } catch (error: any) {
        console.error('GitHub API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch GitHub data' });
    }
}
