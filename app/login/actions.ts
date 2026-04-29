"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  if (value.startsWith("/login") || value.startsWith("/signup")) return "/account";

  return value;
}

function loginRedirect(error: string, next: string) {
  redirect(
    `/login?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`,
  );
}

export async function login(formData: FormData) {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const next = normalizeNext(formData.get("next"));

  if (!email || !password) {
    loginRedirect("Enter your email and password.", next);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginRedirect("Invalid email or password.", next);
  }

  redirect(next);
}
