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

function normalisePhone(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

export async function signUp(formData: FormData) {
  const fullName = getFormString(formData, "fullName");
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const phone = normalisePhone(getFormString(formData, "phone"));

  if (!fullName) {
    signupRedirect("Enter your full name.");
  }

  if (!email || !password) {
    signupRedirect("Enter your email and password.");
  }

  if (password.length < 6) {
    signupRedirect("Use a password with at least 6 characters.");
  }

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    signupRedirect("Enter a phone number with at least 10 digits.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    signupRedirect("We could not create that account. Please try again.");
  }

  // Save the phone (and full name) onto the public profile so the admin can see it.
  // The profile row is auto-created by the auth trigger; we update it here.
  if (data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", data.user.id);
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
