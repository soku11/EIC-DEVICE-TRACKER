export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { text } = req.body;

  console.log("🟦 Incoming API Request:", text);

  // Read the webhook URL
  const webhookUrl = process.env.NEXT_PUBLIC_TEAMS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("❌ TEAMS_WEBHOOK_URL is missing!");
    return res.status(500).json({ error: "Webhook URL not configured" });
  }

  try {
    console.log("🔵 Sending to:", webhookUrl);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const result = await response.text();
    console.log("🟩 Teams Response:", result);

    if (!response.ok) {
      console.error("❌ Teams returned error:", result);
      return res.status(500).json({ error: "Teams webhook failed", details: result });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
