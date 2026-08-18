import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const preference = (await cookies()).get("koa-language")?.value;
  redirect(preference === "karen" ? "/karen" : "/en");
}
