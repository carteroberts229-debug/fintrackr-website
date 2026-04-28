export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  if (!resendKey || !brevoKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Add contact to Brevo FinSavr Waitlist (list ID 5)
  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, listIds: [5], updateEnabled: true }),
  });

  // Send welcome email via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FinSavr <onboarding@resend.dev>',
      to: [email],
      subject: "You're on the FinSavr waitlist!",
      text: `You're officially on the FinSavr waitlist! 🎉\n\nWe'll send you an email the moment we go live. Stay tuned — something great is coming.\n\n— The FinSavr Team`,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.json();
    return res.status(500).json({ error: err.message || 'Failed to send welcome email' });
  }

  return res.status(200).json({ success: true });
}
