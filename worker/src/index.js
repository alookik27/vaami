const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function callIdFromPath(pathname) {
  const id = pathname.split("/")[2];
  return id || "";
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders,
        });
      }

      if (request.method === "GET" && url.pathname === "/calls") {
        const result = await env.DB.prepare(
          "SELECT * FROM calls ORDER BY created_at DESC",
        ).all();

        return json(result.results);
      }

      if (request.method === "GET" && url.pathname.startsWith("/calls/")) {
        const id = callIdFromPath(url.pathname);

        if (!id) {
          return json({ error: "Call ID is required" }, 400);
        }

        const call = await env.DB.prepare("SELECT * FROM calls WHERE id = ?")
          .bind(id)
          .first();

        if (!call) {
          return json({ error: "Call not found" }, 404);
        }

        const transcripts = await env.DB.prepare(
          `SELECT speaker, text, timestamp
           FROM transcripts
           WHERE call_id = ?
           ORDER BY id ASC`,
        )
          .bind(id)
          .all();

        const metrics = await env.DB.prepare(
          `SELECT stt_latency, llm_latency, tts_latency
           FROM call_metrics
           WHERE call_id = ?`,
        )
          .bind(id)
          .first();

        return json({
          ...call,
          transcripts: transcripts.results,
          metrics: metrics || null,
        });
      }

      if (request.method === "POST" && url.pathname === "/calls") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const {
          id,
          startTime,
          endTime,
          duration,
          transcript = [],
          metrics = {},
        } = body ?? {};

        if (!id || !startTime) {
          return json({ error: "id and startTime are required" }, 400);
        }

        if (!Array.isArray(transcript)) {
          return json({ error: "transcript must be an array" }, 400);
        }

        for (const message of transcript) {
          if (!message?.speaker || !message?.text) {
            return json(
              { error: "Each transcript message needs speaker and text" },
              400,
            );
          }
        }

        const statements = [
          env.DB.prepare(
            `INSERT INTO calls
             (id, start_time, end_time, duration)
             VALUES (?, ?, ?, ?)`,
          ).bind(id, startTime, endTime ?? null, duration ?? null),
        ];

        for (const message of transcript) {
          statements.push(
            env.DB.prepare(
              `INSERT INTO transcripts
               (call_id, speaker, text, timestamp)
               VALUES (?, ?, ?, ?)`,
            ).bind(
              id,
              message.speaker,
              message.text,
              message.timestamp || new Date().toISOString(),
            ),
          );
        }

        statements.push(
          env.DB.prepare(
            `INSERT INTO call_metrics
             (call_id, stt_latency, llm_latency, tts_latency)
             VALUES (?, ?, ?, ?)`,
          ).bind(
            id,
            metrics.stt ?? null,
            metrics.llm ?? null,
            metrics.tts ?? null,
          ),
        );

        await env.DB.batch(statements);

        return json(
          {
            message: "Call saved successfully",
            id,
          },
          201,
        );
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/calls/")) {
        const id = callIdFromPath(url.pathname);

        if (!id) {
          return json({ error: "Call ID is required" }, 400);
        }

        const call = await env.DB.prepare("SELECT id FROM calls WHERE id = ?")
          .bind(id)
          .first();

        if (!call) {
          return json({ error: "Call not found" }, 404);
        }

        await env.DB.batch([
          env.DB.prepare("DELETE FROM transcripts WHERE call_id = ?").bind(id),
          env.DB.prepare("DELETE FROM call_metrics WHERE call_id = ?").bind(id),
          env.DB.prepare("DELETE FROM calls WHERE id = ?").bind(id),
        ]);

        return json({ message: "Call deleted successfully", id });
      }

      return json({ error: "Route not found" }, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal error";
      return json({ error: message }, 500);
    }
  },
};
