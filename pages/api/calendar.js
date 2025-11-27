// api/enviarAccionCalendario.js

// URL del Web App de Apps Script
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfmuEnF_Qug9-QE_sr9_JKK_uV6uW8kPRT8YMyonFxxy90w27GfzNrzc17ieFFf4kxgw/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // 🔹 Verificamos que vengan los campos mínimos requeridos
    if (!body.start || !body.end || !body.title) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    // 🔹 Enviamos los datos directamente al Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
}
