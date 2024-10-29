"use server";

import { createCheckout as createCheckoutService } from "@/lib/server-services/lemon-squeezy";
import { supabaseServer } from "../supabase/server";

export async function createCheckout({ amount }: { amount: number }) {
  const supabase = supabaseServer();
  const user = await supabase.auth.getUser();

  // get from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.data.user?.id as string)
    .single();

  // cerate a row in the payments table and get the id that was generated
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ user_id: profile?.id as string })
    .select()
    .single();

  const response = await createCheckoutService({
    amount,
    email: profile?.email as string,
    displayName: profile?.display_name as string,
    paymentId: payment?.id as string,
    userId: user.data.user?.id as string,
  });

  return response;
}
