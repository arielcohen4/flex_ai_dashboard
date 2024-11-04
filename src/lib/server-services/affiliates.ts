import axios from "axios";

const API_KEY = process.env.FIRSTPROMOTER_API_KEY;

export default class AffiliatesService {
  public static signUp = async ({
    email,
    referral,
  }: {
    email: string;
    referral: string;
  }) => {
    try {
      await axios.post(
        "https://firstpromoter.com/api/v1/track/signup",
        {
          ref_id: referral,
          email,
        },
        { headers: { "x-api-key": API_KEY } }
      );
    } catch (error) {
      console.error(error);
    }
  };

  public static sendFirstPromoter = async function ({
    email,
    amount,
  }: {
    email: string;
    amount: number;
  }) {
    const postData = {
      email,
      currency: "USD",
      amount,
    };

    try {
      await axios.post(
        "https://firstpromoter.com/api/v1/track/sale",
        postData,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
}
