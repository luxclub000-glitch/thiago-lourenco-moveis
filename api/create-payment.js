export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const accessToken = process.env.mp_access_token;

    if (!accessToken) {
      return res.status(500).json({
        error: "Token do Mercado Pago não configurado na Vercel."
      });
    }

    const { items, payer, order } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Nenhum produto recebido." });
    }

    const preference = {
      items: items.map((item) => ({
        title: String(item.title || "Produto"),
        quantity: Number(item.quantity || 1),
        currency_id: "BRL",
        unit_price: Number(item.unit_price || 0)
      })),
      payer: {
        name: payer?.name || "",
        email: payer?.email || ""
      },
      metadata: {
        order: order || {}
      },
      back_urls: {
        success: "https://thiago-lourenco-moveis1.vercel.app/",
        failure: "https://thiago-lourenco-moveis1.vercel.app/",
        pending: "https://thiago-lourenco-moveis1.vercel.app/"
      },
      auto_return: "approved"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao criar pagamento no Mercado Pago.",
        details: data
      });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao criar pagamento.",
      details: error.message
    });
  }
}
