import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/shopify/config";

const TOPIC_TAGS: Record<string, string[]> = {
  products: [TAGS.products],
  collections: [TAGS.collections, TAGS.products],
  inventory_levels: [TAGS.products],
  inventory_items: [TAGS.products],
  menus: [TAGS.menus],
  articles: [TAGS.content],
  blogs: [TAGS.content],
  pages: [TAGS.content],
};

function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(body, "utf8").digest();
  const received = Buffer.from(signature, "base64");
  return received.length === digest.length && timingSafeEqual(received, digest);
}

/** Shopify webhook endpoint (e.g. products/update) that expires the matching cache tags. */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook secret not configured" }, { status: 500 });

  const body = await request.text();
  if (!isValidSignature(body, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const tags = TOPIC_TAGS[topic.split("/")[0]] ?? [];
  for (const tag of tags) revalidateTag(tag, "max");

  return Response.json({ revalidated: tags, topic });
}
