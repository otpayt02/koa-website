import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { donations } from "@/db/schema";
import { ApiError, booleanField, emailField, enumField, handleApi, jsonOk, newId, numberField, pagination, readJson, textField } from "@/lib/api";
import { audit } from "@/lib/audit-logger";
import { optionalUser, requireAnyRole } from "@/lib/auth";
import { getBindings } from "@/lib/cloudflare";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    enforceRateLimit(request, "donation-intent", 5, 60 * 60_000);
    const user = await optionalUser(request);
    const body = await readJson(request);
    const anonymous = body.anonymous === undefined ? false : booleanField(body.anonymous, "anonymous");
    const amountCents = Math.round(numberField(body.amountCents, "amountCents", 100, 10_000_000));
    const donation = {
      id: newId("donation"), donorId: user?.id,
      donorName: anonymous ? null : textField(body.donorName, "donorName", { max: 160 }), donorEmail: anonymous && !body.donorEmail ? null : emailField(body.donorEmail, "donorEmail"), anonymous,
      amountCents, currency: "USD", frequency: enumField(body.frequency, "frequency", ["one_time", "monthly"] as const), purpose: textField(body.purpose, "purpose", { max: 500 }),
    };
    await getDb().insert(donations).values(donation);
    await audit(request, { actor: user, action: "donation.intent.create", entity: "donation", entityId: donation.id, after: { amountCents, currency: "USD", frequency: donation.frequency, anonymous } });
    const checkoutBase = getBindings().DONATION_CHECKOUT_URL;
    return jsonOk({ donation: { id: donation.id, status: "pending" }, checkoutUrl: checkoutBase ? `${checkoutBase}${checkoutBase.includes("?") ? "&" : "?"}reference=${encodeURIComponent(donation.id)}` : null, notice: checkoutBase ? "Complete payment with KOA's configured payment provider." : "Payment processing is not configured. This record is a donation intent only; no payment or tax receipt has been issued." }, { status: 201 });
  });
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    await requireAnyRole(request, ["admin"]);
    const { limit, offset } = pagination(request.url, 100);
    const rows = await getDb().select().from(donations).orderBy(desc(donations.createdAt)).limit(limit).offset(offset);
    return jsonOk({ donations: rows, pagination: { limit, offset } });
  });
}

export async function PATCH(request: Request) {
  return handleApi(request, async () => {
    const user = await requireAnyRole(request, ["admin"]);
    const body = await readJson(request);
    const id = textField(body.id, "id", { required: true, max: 80 })!;
    const status = enumField(body.status, "status", ["paid", "failed", "refunded", "cancelled"] as const);
    const provider = textField(body.provider, "provider", { required: status === "paid", max: 80 });
    const providerReference = textField(body.providerReference, "providerReference", { required: status === "paid", max: 200 });
    const receiptNumber = status === "paid" ? `KOA-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` : null;
    const [item] = await getDb().update(donations).set({ status, provider, providerReference, receiptNumber, receiptIssuedAt: status === "paid" ? new Date() : null, updatedAt: new Date() }).where(eq(donations.id, id)).returning();
    if (!item) throw new ApiError(404, "Donation not found");
    await audit(request, { actor: user, action: `donation.${status}`, entity: "donation", entityId: id, after: { status, provider, providerReference, receiptNumber } });
    return jsonOk({ donation: item });
  });
}
