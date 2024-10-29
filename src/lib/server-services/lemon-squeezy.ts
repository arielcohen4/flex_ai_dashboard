import axios from "axios";
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY!;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID!;
const LEMON_SQUEEZY_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID!;

export async function createCheckout({
  userId,
  paymentId,
  amount,
  email,
  displayName,
}: {
  userId: string;
  paymentId: string;
  amount: number;
  email: string;
  displayName: string;
}) {
  try {
    const response = await axios.post(
      "https://api.lemonsqueezy.com/v1/checkouts",
      {
        data: {
          type: "checkouts",
          attributes: {
            custom_price: amount * 100,
            checkout_data: {
              email,
              name: displayName,
              custom: {
                user_id: userId,
                payment_id: paymentId,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: LEMON_SQUEEZY_STORE_ID, // Replace with your store ID
              },
            },
            variant: {
              data: {
                type: "variants",
                id: LEMON_SQUEEZY_VARIANT_ID, // Replace with your variant ID
              },
            },
          },
        },
      },
      {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Error cancel job on runpod: ${err}`);
    return null;
  }
}
