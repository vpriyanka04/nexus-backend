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
      page: 1,
      per_page: parseInt(count) || 8,
      person_titles: ['CEO', 'Founder', 'Co-Founder', 'Managing Director', 'Director'],
      q_organization_keyword_tags: industry ? [industry] : [],
      organization_locations: location ? [location] : [],
      organization_num_employees_ranges: (minSize && maxSize) ? [`${minSize},${maxSize}`] : []
    };

    const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY
      },
      body: JSON.stringify(body)
    });

    const apolloData = await apolloRes.json();

    if (!apolloRes.ok) {
      return res.status(200).json({
        success: false,
        apolloStatus: apolloRes.status,
        apolloError: apolloData,
        companies: []
      });
    }

    const people = apolloData.people || [];

    const cleaned = people.map(p => ({
      name: p.name || '',
      title: p.title || '',
      email: p.email || '',
      linkedin: p.linkedin_url || '',
      phone: p.sanitized_phone || '',
      company: p.organization?.name || '',
      website: p.organization?.website_url || p.organization?.primary_domain || '',
      industry: p.organization?.industry || '',
      headcount: p.organization?.estimated_num_employees || '',
      location: [p.city, p.state, p.country].filter(Boolean).join(', '),
      founded: p.organization?.founded_year || '',
      description: p.organization?.short_description || '',
      keywords: (p.organization?.keywords || []).slice(0, 5).join(', ')
    }));

    return res.status(200).json({ success: true, count: cleaned.length, companies: cleaned });

  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, companies: [] });
  }
}
