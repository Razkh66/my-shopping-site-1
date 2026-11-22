"use client";
import { useState } from "react";
import { uploadSlip } from "@/app/actions";
export default function SlipUpload({ number }: { number: string }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = (e.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0]; if (!f) return;
    setBusy(true);
    const bmp = await createImageBitmap(f); const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/webp", 0.75));
    const fd = new FormData(); fd.set("number", number); fd.set("file", new File([blob], "slip.webp", { type: "image/webp" }));
    await uploadSlip(fd); setBusy(false);
  }
  return (<form onSubmit={onSubmit} className="space-y-2"><input name="file" type="file" accept="image/*" required className="inp" />
    <button className="btn" disabled={busy}>{busy ? "Uploading..." : "Upload payment slip"}</button></form>);
}
