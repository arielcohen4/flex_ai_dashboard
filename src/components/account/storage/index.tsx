"use client";
import ContentSection from "../layout/content-section";
import { StorageForm } from "./storage-form";

export default function SettingsAccount() {
  return (
    <ContentSection
      title="Connect your S3 Bucket"
      desc="Create a bucket on AWS and connect it to store your datasets securely."
    >
      <StorageForm />
    </ContentSection>
  );
}
