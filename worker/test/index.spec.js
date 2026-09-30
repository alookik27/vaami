import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	applyD1Migrations,
} from "cloudflare:test";
import { beforeAll, describe, it, expect } from "vitest";
import worker from "../src";

beforeAll(async () => {
	await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});

describe("calls API", () => {
	it("lists calls as a JSON array", async () => {
		const request = new Request("http://example.com/calls");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	it("rejects a call body that is not JSON", async () => {
		const request = new Request("http://example.com/calls", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "not-json",
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBe("Invalid JSON body");
	});

	it("saves a call and its transcript in one batch", async () => {
		const request = new Request("http://example.com/calls", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: "call-test",
				startTime: "2026-09-29T10:00:00.000Z",
				endTime: "2026-09-29T10:00:05.000Z",
				duration: 5,
				transcript: [
					{
						speaker: "user",
						text: "Hello",
						timestamp: "2026-09-29T10:00:01.000Z",
					},
				],
				metrics: {},
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(201);

		const detailRequest = new Request("http://example.com/calls/call-test");
		const detailCtx = createExecutionContext();
		const detail = await worker.fetch(detailRequest, env, detailCtx);
		await waitOnExecutionContext(detailCtx);
		const body = await detail.json();

		expect(body.id).toBe("call-test");
		expect(body.transcripts).toEqual([
			{
				speaker: "user",
				text: "Hello",
				timestamp: "2026-09-29T10:00:01.000Z",
			},
		]);
	});
});
