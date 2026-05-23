"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration
const endpointUrl = process.env.DO_SPACES_ENDPOINT ?? "https://nyc3.digitaloceanspaces.com";
const accessKeyId = process.env.DO_SPACES_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.DO_SPACES_SECRET_ACCESS_KEY ?? "";
const region = process.env.DO_SPACES_REGION ?? "nyc3";

const s3Client = new S3Client({
  region: region,
  endpoint: endpointUrl,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

export async function generatePresignedUrl({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error(`Error generating presigned URL: ${err}`);
    return null;
  }
}
