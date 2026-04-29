"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function signupRedirect(error: string) {
  redirect(`/signup?error=${encodeURIComponent(error)}`);
}

export async function signUp(formData: FormData) {
  const fullName = getFormString(formData, "fullName");
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  if (!email || !password) {
    signupRedirect("Enter your email and password.");
  }

  if (password.length < 6) {
    signupRedirect("Use a password with at least 6 characters.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    signupRedirect("We could not create that account. Please try again.");
  }

  if (data.session) {
    redirect("/account");
  }

  redirect(
    `/signup?message=${encodeURIComponent(
      "Check your email to confirm your Neuvesca account.",
    )}`,
  );
}
