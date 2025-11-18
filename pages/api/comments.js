import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { method, query, body } = req;

  // ==============================
  // 🔹 GET latest comment for device
  // ==============================
  if (method === "GET") {
    const { deviceId } = query;

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        device_id,
        user_id,
        comment,
        created_at,
        users:user_id (
          username
        )
      `
      )
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.log(error);
      return res.status(400).json({});
    }

    return res.status(200).json(data || {});
  }

  // ==============================
  // 🔹 POST → Add new comment
  // ==============================
  if (method === "POST") {
    const { deviceId, userId, comment } = body;

    // ❗ delete old comment first → only single active comment allowed
    await supabase.from("comments").delete().eq("device_id", deviceId);

    const { error } = await supabase.from("comments").insert([
      {
        device_id: deviceId,
        user_id: userId,
        comment,
      },
    ]);

    if (error) return res.status(400).json({ error });

    return res.status(200).json({ success: true });
  }

  // ==============================
  // 🔹 DELETE → remove ALL comments for the device
  // ==============================
  if (method === "DELETE") {
    const { deviceId } = query;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("device_id", deviceId);

    if (error) return res.status(400).json({ error });

    return res.status(200).json({ success: true });
  }

  // Invalid HTTP method
  return res.status(405).json({ error: "Method not allowed" });
}
