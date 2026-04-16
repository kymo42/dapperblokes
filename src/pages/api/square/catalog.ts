import type { APIRoute } from "astro";
import { listSquareCatalogItems } from "../../../lib/square";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
	const env = (locals.runtime as { env?: Record<string, string> } | undefined)?.env;
	const token = env?.SQUARE_ACCESS_TOKEN;

	if (!token) {
		return new Response(
			JSON.stringify({ error: "Missing SQUARE_ACCESS_TOKEN secret in Cloudflare Worker environment" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	const url = new URL(request.url);
	const limitParam = Number(url.searchParams.get("limit") ?? "50");
	const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

	try {
		const catalog = await listSquareCatalogItems(token, limit);
		return new Response(JSON.stringify(catalog), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Square catalog fetch failed",
			}),
			{
				status: 502,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};
