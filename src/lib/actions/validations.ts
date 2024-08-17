"use server";
import { S3 } from "aws-sdk";

export async function validateS3({
  accessKeyId,
  secretAccessKey,
  bucketName,
}: {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}) {
  const s3 = new S3({
    accessKeyId,
    secretAccessKey,
  });

  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    return true;
  } catch (err) {
    console.error("Error verifying AWS credentials:", err);
    return false;
  }
}
