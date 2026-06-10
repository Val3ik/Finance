import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const result = await client.execute(
        "SELECT * FROM transactions ORDER BY id DESC"
      );
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { amount, description, type, date, added_by } = req.body;
      await client.execute({
        sql: "INSERT INTO transactions (amount, description, type, date, added_by) VALUES (?, ?, ?, ?, ?)",
        args: [amount, description, type, date, added_by || ""],
      });
      return res.status(200).json({ status: "ok" });
    }

    if (req.method === "PUT") {
      const id = req.query.id;
      const { amount, description, type } = req.body;
      await client.execute({
        sql: "UPDATE transactions SET amount=?, description=?, type=? WHERE id=?",
        args: [amount, description, type, id],
      });
      return res.status(200).json({ status: "ok" });
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      await client.execute({
        sql: "DELETE FROM transactions WHERE id=?",
        args: [id],
      });
      return res.status(200).json({ status: "ok" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
