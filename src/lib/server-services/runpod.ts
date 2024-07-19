"use server";
import axios from "axios";
const API_KEY = "1PR807JX2IWODKRE997ONQNIF9GVTT5YREAM9E3L";

export async function cancelJobId({ id }: { id: string }) {
  try {
    const response = await axios.post(
      `https://api.runpod.ai/v2/d1943b5dxkvq9m/cancel/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response;
  } catch (err) {
    console.error(`Error cancel job on runpod: ${err}`);
    return null;
  }
}
