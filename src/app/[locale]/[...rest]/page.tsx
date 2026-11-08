import { notFound } from "next/navigation";

/** Renders the localized 404 page for unknown URLs inside a locale. */
export default function CatchAll() {
  notFound();
}
