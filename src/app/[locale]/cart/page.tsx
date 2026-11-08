import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getI18n } from "@/i18n/server";
import { CartView } from "./cart-view";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.cart.title, robots: { index: false } };
}

export default async function CartPage() {
  const { dict } = await getI18n();
  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: dict.cart.title }]} />
      <h1 className="mb-6 text-3xl md:text-4xl">{dict.cart.title}</h1>
      <Suspense fallback={<p className="py-16 text-center text-muted">{dict.cart.loading}</p>}>
        <CartView />
      </Suspense>
    </div>
  );
}
