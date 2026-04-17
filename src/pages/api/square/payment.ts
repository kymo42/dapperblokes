import type { APIRoute } from "astro";
import { createSquarePayment } from "../../../lib/square";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};

	const accessToken  = env.SQUARE_ACCESS_TOKEN;
	const locationId   = env.SQUARE_LOCATION_ID ?? env.PUBLIC_SQUARE_LOCATION_ID;

	if (!accessToken || !locationId) {
		return new Response(
			JSON.stringify({ error: "Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in your Cloudflare Worker environment." }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}

	let body: {
		sourceId?: string;
		amountCents?: number;
		currency?: string;
		note?: string;
		buyerEmail?: string;
		idempotencyKey?: string;
	};

	try {
		body = await request.json() as typeof body;
	} catch {
		return new Response(
			JSON.stringify({ error: "Invalid request body" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	const { sourceId, amountCents, currency, note, buyerEmail, idempotencyKey } = body;

	if (!sourceId || typeof sourceId !== "string") {
		return new Response(
			JSON.stringify({ error: "Missing sourceId (payment token)" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	if (!amountCents || typeof amountCents !== "number" || amountCents <= 0) {
		return new Response(
			JSON.stringify({ error: "Invalid amount" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		const result = await createSquarePayment(accessToken, {
			sourceId,
			amountCents,
			currency: currency ?? "AUD",
			locationId,
			note,
			buyerEmail,
			idempotencyKey,
		});

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({ error: error instanceof Error ? error.message : "Payment failed" }),
			{ status: 502, headers: { "Content-Type": "application/json" } },
		);
	}
};
