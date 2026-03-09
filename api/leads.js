export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const APOLLO_KEY = process.env.APOLLO_API_KEY;
  if (!APOLLO_KEY) return res.status(500).json({ error: 'Apollo API key not configured' });

  const { industry, location, minSize, maxSize, count } = req.body;

  try {
    const body = {
      api_key: APOLLO_KEY,
      page: 1,
      per_page: parseInt(count) || 8
    };

    if (industry) body.q_organization_keyword_tags = [industry];
    if (location) body.organization_locations = [location];
    if (minSize && maxSize) body.organization_num_employees_ranges = [`${minSize},${maxSize}`];

    const apolloRes = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(body)
    });

    const apolloData = await apolloRes.json();

    if (!apolloRes.ok) {
      return res.status(200).json({ success: false, apolloStatus: apolloRes.status, apolloError: apolloData, companies: [] });
    }

    const organizations = apolloData.organizations || [];

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

    return res.status(200).json({ success: true, count: cleaned.length, companies: cleaned });

  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, companies: [] });
  }
}
