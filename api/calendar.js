// api/enviarAccionCalendario.js

// URL del Web App de Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwfmuEnF_Qug9-QE_sr9_JKK_uV6uW8kPRT8YMyonFxxy90w27GfzNrzc17ieFFf4kxgw/exec";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { action } = body;

    if (!action) {
      return res.status(400).json({ status: "error", message: "Missing action" });
    }

    // Enviamos el body tal cual a Apps Script
    const resp = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    // Devolvemos la respuesta REAL al GPT
    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
}



