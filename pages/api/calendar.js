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

    // Validar que sea JSON
    try {
      JSON.parse(rawBody);
    } catch {
      return res
        .status(400)
        .json({ status: "error", message: "Cuerpo no es JSON válido", raw: rawBody });
    }

    // Timeout para no quedar colgado si Apps Script se pega
    const controller = new AbortController();
    const timeoutMs = 10000; // 10 segundos
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: rawBody,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);

      if (error.name === "AbortError") {
        return res.status(504).json({
          status: "error",
          message: `Timeout al llamar al backend después de ${timeoutMs}ms`,
        });
      }

      console.error("Fetch error:", error);
      return res.status(502).json({
        status: "error",
        message: "Error al conectar con el backend",
      });
    }

    clearTimeout(timeout);

    const text = await response.text();

    let data;
    let parseError = false;
    try {
      data = JSON.parse(text);
    } catch {
      parseError = true;
    }

    // Si el backend no respondió OK, o no es JSON válido, o no trae status,
    // devolvemos siempre un objeto con status="error"
    if (
      !response.ok ||
      parseError ||
      typeof data !== "object" ||
      data === null ||
      typeof data.status === "undefined"
    ) {
      const statusCode = !response.ok
        ? response.status || 502
        : parseError
        ? 502
        : 502;

      return res.status(statusCode).json({
        status: "error",
        message: !response.ok
          ? `Backend respondió HTTP ${response.status}`
          : parseError
          ? "Respuesta del backend no es JSON válido"
          : "Respuesta del backend no incluye campo 'status'",
        raw: text,
      });
    }

    // Camino feliz: propagamos el status HTTP real del backend
    const statusCode = response.status || 200;
    return res.status(statusCode).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res
      .status(500)
      .json({ status: "error", message: error.message || "Error interno en proxy" });
  }
}
