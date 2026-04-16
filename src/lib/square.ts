const SQUARE_API_BASE = "https://connect.squareup.com/v2";

export interface SquareCatalogItem {
	id: string;
	type?: string;
	present_at_all_locations?: boolean;
	item_data?: {
		name?: string;
		description?: string;
	};
}

export interface SquareCatalogResponse {
	objects?: SquareCatalogItem[];
	cursor?: string;
	errors?: { code?: string; detail?: string }[];
}

export async function listSquareCatalogItems(accessToken: string, limit = 100): Promise<SquareCatalogResponse> {
	const url = new URL(`${SQUARE_API_BASE}/catalog/list`);
	url.searchParams.set("types", "ITEM");
	url.searchParams.set("limit", String(limit));

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Square-Version": "2026-03-18",
			"Content-Type": "application/json",
		},
	});

	const payload = (await response.json()) as SquareCatalogResponse;

	if (!response.ok) {
		throw new Error(payload.errors?.[0]?.detail ?? "Square API request failed");
	}

	return payload;
}
