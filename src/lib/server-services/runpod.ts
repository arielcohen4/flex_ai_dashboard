"use server";
import axios from "axios";
const API_KEY = process.env.RUNPOD_API_KEY;

export async function cancelJobId({
  endpointId,
  id,
}: {
  endpointId: string;
  id: string;
}) {
  try {
    const response = await axios.post(
      `https://api.runpod.ai/v2/${endpointId}/cancel/${id}`,
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
