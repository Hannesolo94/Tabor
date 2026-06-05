import Link from "next/link";
import { ProductForm } from "../ProductForm";
import { GOLD, MONO, CINZEL } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default function NewProduct() {
  return (
    <div>
      <Link href="/admin/products" style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", textDecoration: "none" }}>← PRODUCTS</Link>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", margin: "16px 0 6px" }}>[ NEW ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 28, color: "#E8E2D5", margin: "0 0 24px" }}>Add a Product</h1>
      <ProductForm isNew />
    </div>
  );
}
