export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'online',
    agent: 'Nexus',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apollo_configured: !!process.env.APOLLO_API_KEY,
    anthropic_configured: !!process.env.ANTHROPIC_API_KEY
  });
}
```

Nothing after the closing `}` — commit and then visit:
```
https://nexus-backend-sooty.vercel.app/api/health
