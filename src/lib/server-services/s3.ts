"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration
const endpointUrl = "https://nyc3.digitaloceanspaces.com";
const accessKeyId = "DO00TNGBCCCAQYGDDNGV";
const secretAccessKey = "/FjJc5Ok51EdNAajx06dvjWfNIFN5VjkgbZbJHvh/t0";
const region = "nyc3";

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
