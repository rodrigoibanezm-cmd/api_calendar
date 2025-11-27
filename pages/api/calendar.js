// pages/api/calendar.js

// URL del Web App de Apps Script
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfmuEnF_Qug9-QE_sr9_JKK_uV6uW8kPRT8YMyonFxxy90w27GfzNrzc17ieFFf4kxgw/exec";

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    // Validar que lleguen los campos necesarios
    if (!body.start || !body.end || !body.title) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    // Enviar los datos al Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Leer respuesta como texto (Apps Script puede devolver texto o JSON)
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text); // si es JSON válido
    } catch {
      data = { raw: text }; // si es texto plano
    }

    // Devolver respuesta al cliente
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res
      .status(500)
      .json({ status: "error", message: error.message });
  }
}

