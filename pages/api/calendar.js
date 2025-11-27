// pages/api/calendar.js

// URL del Web App de Apps Script
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwfmuEnF_Qug9-QE_sr9_JKK_uV6uW8kPRT8YMyonFxxy90w27GfzNrzc17ieFFf4kxgw/exec";

// Deshabilitar el body parser por defecto de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    // Leer el cuerpo completo manualmente (como texto)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();

    // Intentamos parsear para validar JSON
    let jsonData;
    try {
      jsonData = JSON.parse(rawBody);
    } catch {
      return res
        .status(400)
        .json({ status: "error", message: "Cuerpo no es JSON válido", raw: rawBody });
    }

    // Reenviar el mismo cuerpo crudo al Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res
      .status(500)
      .json({ status: "error", message: error.message });
  }
}
