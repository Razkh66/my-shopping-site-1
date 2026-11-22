"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
const sid = () => cookies().get("sid")?.value ?? "";
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const err = (to: string, m: string) => redirect(`${to}?error=${encodeURIComponent(m)}`);

export async function addToCart(fd: FormData) {
  const { error } = await db().rpc("add_to_cart", { p_sid: sid(), p_vid: s(fd, "variant"), p_qty: Number(s(fd, "qty") || 1) });
  if (error) err("/cart", error.message);
  redirect("/cart");
}
export async function removeItem(fd: FormData) {
  await db().rpc("remove_cart_item", { p_sid: sid(), p_item: s(fd, "id") });
  revalidatePath("/cart");
}
export async function placeOrder(fd: FormData) {
  const { data, error } = await db().rpc("place_order", { p_sid: sid(), p_name: s(fd, "name"), p_email: s(fd, "email"),
    p_phone: s(fd, "phone"), p_address: s(fd, "address"), p_dest: s(fd, "dest") });
  if (error) err("/checkout", error.message);
  redirect(`/order/${data}`);
}
export async function uploadSlip(fd: FormData) {
  const number = s(fd, "number"); const file = fd.get("file") as File;
  const path = `${number}-${Date.now()}.webp`;
  const up = await db().storage.from("slips").upload(path, file, { contentType: "image/webp" });
  if (up.error) throw new Error(up.error.message);
  await db().rpc("slip_uploaded", { p_n: number, p_path: path });
  revalidatePath(`/order/${number}`);
}
export async function setStatus(fd: FormData) {
  await db().rpc("set_order_status", { p_n: s(fd, "number"), p_s: s(fd, "status") });
  revalidatePath("/admin");
}
