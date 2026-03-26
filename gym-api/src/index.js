export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const method = request.method;

    function json(data) {
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // ---------- MEMBERS ----------

    if (url.pathname === "/members" && method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM members"
      ).all();

      return json(results);
    }

    if (url.pathname === "/members" && method === "POST") {

  const body = await request.json();

  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO members
    (id, name, phone, address,
     package_id, package_price,
     total_amount, paid_amount,
     package_start_date,
     photo,
     active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
  )
    .bind(
      id,
      body.name,
      body.phone,
      body.address,
      body.packageId,
      body.packagePrice,
      body.totalAmount,
      body.paidAmount,
      body.packageStartDate,
      body.photo || null
    )
    .run();

  return json({ ok: true });
}
if (url.pathname.startsWith("/members/") && method === "PUT") {

  const id = url.pathname.split("/")[2];

  const body = await request.json();

  await env.DB.prepare(
    `UPDATE members
     SET name = ?,
         phone = ?,
         address = ?,
         package_id = ?,
         package_price = ?,
         total_amount = ?,
         paid_amount = ?,
         package_start_date = ?,
         photo = ?,
         updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      body.name,
      body.phone,
      body.address,
      body.packageId,
      body.packagePrice,
      body.totalAmount,
      body.paidAmount,
      body.packageStartDate,
      body.photo || null,
      id
    )
    .run();

  return json({ ok: true });
}
    // ---------- PACKAGES ----------

    if (url.pathname === "/packages" && method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM packages"
      ).all();

      return json(results);
    }

    if (url.pathname === "/packages" && method === "POST") {
      const body = await request.json();

      const id = crypto.randomUUID();

      await env.DB.prepare(
        `INSERT INTO packages
        (id, name, duration_days, base_price, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
      )
        .bind(
          id,
          body.name,
          body.durationDays,
          body.basePrice
        )
        .run();

      return json({ ok: true });
    }

    if (url.pathname.startsWith("/packages/") && method === "DELETE") {
      const id = url.pathname.split("/")[2];

      await env.DB.prepare(
        "DELETE FROM packages WHERE id=?"
      )
        .bind(id)
        .run();

      return json({ ok: true });
    }
    if (url.pathname.startsWith("/packages/") && method === "PUT") {
  const id = url.pathname.split("/")[2];

  const body = await request.json();

  await env.DB.prepare(
    `UPDATE packages
     SET name = ?,
         duration_days = ?,
         base_price = ?,
         updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      body.name,
      body.durationDays,
      body.basePrice,
      id
    )
    .run();

  return json({ ok: true });
}

   

    // ---------- PAYMENTS ----------

if (url.pathname === "/payments" && method === "GET") {
  const { results } = await env.DB.prepare(
    "SELECT * FROM payments"
  ).all();

  return json(results);
}

if (url.pathname === "/payments" && method === "POST") {

  const body = await request.json();

  const id = crypto.randomUUID();

  // insert payment
  await env.DB.prepare(
    `INSERT INTO payments
    (id, member_id, amount, created_at)
    VALUES (?, ?, ?, datetime('now'))`
  )
    .bind(
      id,
      body.memberId,
      body.amount
    )
    .run();


  // update member paid_amount
  await env.DB.prepare(
    `UPDATE members
     SET paid_amount = COALESCE(paid_amount, 0) + ?
     WHERE id = ?`
  )
    .bind(
      body.amount,
      body.memberId
    )
    .run();

  return json({ ok: true });
}


return new Response("Not found", {
  status: 404,
  headers: corsHeaders,
});

  },
};