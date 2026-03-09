// Health check endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'online',
    agent: 'Specter',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apollo_configured: !!process.env.APOLLO_API_KEY
  });
}
