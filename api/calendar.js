export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const { action, data } = req.body || {};

  if (!action) {
    return res.status(400).json({ status: "error", message: "Missing action" });
  }

  return res.status(200).json({
    status: "proxy-ok",
    actionReceived: action,
    dataReceived: data
  });
}
