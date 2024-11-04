import AffiliatesService from "@/lib/server-services/affiliates";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: any) {
  const supabase = await supabaseAdmin();
  // just print a json of the body
  const data = await req.json();

  const eventName = data.meta.event_name;

  if (eventName === "order_created") {
    const status = data.data.attributes.status;
    if (status === "paid") {
      const paymentId = data.meta.custom_data.payment_id;
      const userId = data.meta.custom_data.user_id;

      // get payment from payments table
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .eq("user_id", userId)
        .single();

      if (payment?.status === "PENDING") {
        const total = data.data.attributes.total / 100;

        // get the user balance and then add the total to it
        const { data: user } = await supabase
          .from("profiles")
          .select("balance, email")
          .eq("id", userId)
          .single();

        await supabase
          .from("profiles")
          .update({
            balance: parseFloat((user?.balance! + total).toFixed(6)),
          })
          .eq("id", userId);

        // update the payment status to PAID
        await supabase
          .from("payments")
          .update({ status: "PAID" })
          .eq("id", paymentId)
          .eq("user_id", userId);

        AffiliatesService.sendFirstPromoter({
          email: user?.email as string,
          // total in cents
          amount: data.data.attributes.total,
        });
      }
      try {
        console.log(data);
        return Response.json({ done: true });
      } catch (e) {
        return Response.json({ error: `Webhook Error` });
      }
    }
  }
}
