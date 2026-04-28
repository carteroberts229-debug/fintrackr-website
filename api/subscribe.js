export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const headers = {
    'api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Create or update contact and add to FinSavr Waitlist (Brevo list ID 5)
  const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, listIds: [5], updateEnabled: true }),
  });

  // 201 = created, 204 = already existed and updated — both are success
  if (contactRes.ok) {
    return res.status(200).json({ success: true });
  }

  const err = await contactRes.json();
  return res.status(500).json({ error: err.message || 'Failed to add to waitlist' });
}
