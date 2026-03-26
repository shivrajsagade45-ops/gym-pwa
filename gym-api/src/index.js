// Helper to generate a unique ID without needing crypto.randomUUID()
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ================= MEMBERS =================
      if (path === "/members" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM members").all();
        return new Response(JSON.stringify(results), { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }
    if (path.startsWith("/members/") && request.method === "PUT") {
        const id = path.split("/")[2];
        const body = await request.json();

    await env.DB.prepare(
    `UPDATE members SET
      name=?,
      phone=?,
      address=?,
      package_id=?,
      package_price=?,
      total_amount=?,
      paid_amount=?,
      package_start_date=?,
      photo=?,
      updated_at=?
     WHERE id=?`
    ).bind(
    body.name,
    body.phone,
    body.address,
    body.packageId,
    body.packagePrice,
    body.totalAmount,
    body.paidAmount,
    body.packageStartDate,
    body.photo || "",
    new Date().toISOString(),
    id
    ).run();

    return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
    );
}
      if (path.startsWith("/members/") && request.method === "PUT") {
        const id = path.split("/")[2];
        const body = await request.json();
        await env.DB.prepare(
          `UPDATE members SET name=?, phone=?, address=?, package_id=?, package_price=?, total_amount=?, paid_amount=?, package_start_date=?, updated_at=? WHERE id=?`
        ).bind(
          body.name, body.phone, body.address, body.packageId, body.packagePrice,
          body.totalAmount, body.paidAmount, body.packageStartDate,
          new Date().toISOString(), id
        ).run();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path.startsWith("/members/") && request.method === "DELETE") {
        const id = path.split("/")[2];
        await env.DB.prepare("DELETE FROM members WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // ================= PACKAGES =================
      if (path === "/packages" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM packages").all();
        return new Response(JSON.stringify(results), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path === "/packages" && request.method === "POST") {
        const body = await request.json();
        const id = generateId(); // <-- Changed from crypto.randomUUID()
        await env.DB.prepare(
          `INSERT INTO packages (id, name, duration_days, base_price, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id, body.name, body.durationDays, body.basePrice,
          1, new Date().toISOString(), new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path.startsWith("/packages/") && request.method === "PUT") {
        const id = path.split("/")[2];
        const body = await request.json();
        await env.DB.prepare(
          `UPDATE packages SET name=?, duration_days=?, base_price=?, updated_at=? WHERE id=?`
        ).bind(body.name, body.durationDays, body.basePrice, new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path.startsWith("/packages/") && request.method === "DELETE") {
        const id = path.split("/")[2];
        await env.DB.prepare("DELETE FROM packages WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // ================= PAYMENTS =================
      if (path === "/payments" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM payments").all();
        return new Response(JSON.stringify(results), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path === "/payments" && request.method === "POST") {
        const body = await request.json();
        const id = generateId(); // <-- Changed from crypto.randomUUID()
        await env.DB.prepare(
          `INSERT INTO payments (id, member_id, amount, payment_date, payment_mode, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id, body.memberId, body.amount, body.paymentDate,
          body.paymentMode, body.note || "", new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // ================= STAFF =================
      if (path === "/staff" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM staff").all();
        return new Response(JSON.stringify(results), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (path === "/staff" && request.method === "POST") {
        const body = await request.json();
        const id = generateId(); // <-- Changed from crypto.randomUUID()
        await env.DB.prepare(
          `INSERT INTO staff (id, name, phone, role, password, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id, body.name, body.phone, body.role, "", 1, new Date().toISOString()
        ).run();
        return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (err) {
      console.error("Worker Error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  },
};