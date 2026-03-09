// Specter Backend — Apollo.io Proxy
// Vercel Serverless Function

export default async function handler(req, res) {
  // Allow requests from any origin (your Specter HTML tool)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { industry, location, minSize, maxSize, count } = req.body;

  if (!industry || !location) {
    return res.status(400).json({ error: 'Missing required fields: industry, location' });
  }

  const APOLLO_KEY = process.env.APOLLO_API_KEY;

  if (!APOLLO_KEY) {
    return res.status(500).json({ error: 'Apollo API key not configured on server' });
  }

  try {
    const apolloRes = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: APOLLO_KEY,
        q_organization_keyword_tags: [industry],
        organization_locations: [location],
        organization_num_employees_ranges: [`${minSize || 11},${maxSize || 50}`],
        page: 1,
        per_page: parseInt(count) || 8
      })
    });

    const apolloData = await apolloRes.json();

    if (!apolloRes.ok) {
      return res.status(apolloRes.status).json({
        error: apolloData.error || 'Apollo API error',
        details: apolloData
      });
    }

    const organizations = apolloData.organizations || [];

    // Clean and return only what Specter needs
    const cleaned = organizations.map(c => ({
      name: c.name || '',
      website: c.website_url || c.primary_domain || '',
      industry: c.industry || '',
      headcount: c.estimated_num_employees || '',
      location: [c.city, c.state, c.country].filter(Boolean).join(', '),
      linkedin: c.linkedin_url || '',
      phone: c.sanitized_phone || c.primary_phone?.number || '',
      keywords: (c.keywords || []).slice(0, 5).join(', '),
      founded: c.founded_year || '',
      description: c.short_description || ''
    }));

    return res.status(200).json({
      success: true,
      count: cleaned.length,
      companies: cleaned
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server error calling Apollo',
      message: err.message
    });
  }
}
