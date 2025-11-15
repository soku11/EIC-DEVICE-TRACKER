export async function sendTeamsMessage(text) {
  try {
    await fetch("/api/send-teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("Teams Error:", err);
  }
}
