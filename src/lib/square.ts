const SQUARE_API_BASE = "https://connect.squareup.com/v2";

// ─── Payments ─────────────────────────────────────────────────────

export interface SquarePaymentRequest {
	sourceId: string;
	amountCents: number;
	currency?: string;
	locationId: string;
	idempotencyKey?: string;
	note?: string;
	buyerEmail?: string;
}

export interface SquarePaymentResponse {
	payment?: {
		id: string;
		status: string;
		amount_money?: { amount: number; currency: string };
		receipt_url?: string;
	};
	errors?: { code?: string; detail?: string }[];
}

export async function createSquarePayment(
	accessToken: string,
	req: SquarePaymentRequest,
): Promise<SquarePaymentResponse> {
	const body: Record<string, unknown> = {
		source_id: req.sourceId,
		idempotency_key: req.idempotencyKey ?? crypto.randomUUID(),
		amount_money: { amount: req.amountCents, currency: req.currency ?? "AUD" },
		location_id: req.locationId,
	};
	if (req.note) body.note = req.note;
	if (req.buyerEmail) body.buyer_email_address = req.buyerEmail;

	const response = await fetch(`${SQUARE_API_BASE}/payments`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Square-Version": "2026-03-18",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const payload = (await response.json()) as SquarePaymentResponse;

	if (!response.ok) {
		throw new Error(payload.errors?.[0]?.detail ?? "Square payment failed");
	}

	return payload;
}

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
