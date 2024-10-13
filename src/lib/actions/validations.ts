"use server";
import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Tables } from "../types/supabase";

export async function validateS3({
  accessKeyId,
  secretAccessKey,
  bucketName,
  region,
}: {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: Tables<"profiles">["aws_region"] | null;
}) {
  try {
    const client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: region ?? "us-east-1",
    });

    // Step 1: Check if credentials are valid and bucket exists
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      if (error instanceof S3ServiceException) {
        switch (error.$metadata.httpStatusCode) {
          case 403:
            return {
              success: false,
              message:
                "Access denied. Your credentials are invalid or Your credentials don't have permission to access this bucket.",
              error: error.message,
            };
          case 404:
            return {
              success: false,
              message: "The specified bucket does not exist.",
              error: error.message,
            };
          default:
            return {
              success: false,
              message: "An error occurred while checking the bucket.",
              error: error.message,
            };
        }
      }
      throw error;
    }

    // Step 2: Check PutObject permission
    const testKey = `test-file-${Date.now()}.txt`;
    const testContent = "This is a test file for S3 permission validation.";

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: testKey,
          Body: testContent,
        })
      );
    } catch (error) {
      return {
        success: false,
        message: "Failed to upload test file. No PutObject permission.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 3: Check GetObject permission
    try {
      await client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: testKey,
        })
      );
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve test file. No GetObject permission.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Step 4: Check DeleteObject permission
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: testKey,
        })
      );
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete test file. No DeleteObject permission.",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // All checks passed
    return {
      success: true,
      message:
        "Successfully validated S3 access and permissions (PutObject, GetObject, DeleteObject).",
    };
  } catch (error) {
    console.error("Error during S3 validation:", error);
    return {
      success: false,
      message: "An unknown error occurred during S3 validation.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
