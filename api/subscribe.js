export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Add contact to Brevo FinSavr Waitlist (list ID 5)
  const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, listIds: [5], updateEnabled: true }),
  });

  if (contactRes.ok) {
    return res.status(200).json({ success: true });
  }

  const err = await contactRes.json();
  return res.status(500).json({ error: err.message || 'Failed to add to waitlist' });
}
