"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useUser from "@/app/hook/useUser";
import { validateS3 } from "@/lib/actions/validations";
import { toast } from "@/components/ui/use-toast";
import { ExternalLink } from "lucide-react";

export function StorageForm() {
  const user = useUser();

  const [bucketName, setBucketName] = useState(user.data?.aws_bucket ?? "");
  const [accessKeyId, setAccessKeyId] = useState(
    user.data?.aws_access_key_id ?? ""
  );
  const [secretAccessKey, setSecretAccessKey] = useState(
    user.data?.aws_secret_access_key ?? ""
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.data) {
      setBucketName(user.data.aws_bucket || "");
      setAccessKeyId(user.data.aws_access_key_id || "");
      setSecretAccessKey(user.data.aws_secret_access_key || "");
      setIsConnected(user.data.is_aws_s3 || false);
    }
  }, [user.data]);

  const handleConnect = async () => {
    setError("");
    const response = await validateS3({
      accessKeyId,
      secretAccessKey,
      bucketName,
    });

    if (response.success && user.data) {
      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from("profiles")
        .update({
          is_aws_s3: true,
          aws_bucket: bucketName,
          aws_access_key_id: accessKeyId,
          aws_secret_access_key: secretAccessKey,
        })
        .eq("id", user.data?.id);

      if (error) {
        setError("Failed to update profile. Please try again.");
      } else {
        toast({
          title: "You Connected to AWS S3",
          description: (
            <div>
              You have successfully connected to AWS S3. You can now use it to
              store your datasets.
            </div>
          ),
        });
        setIsConnected(true);
      }
    } else {
      setError(response.message);
    }
  };

  const handleDisconnect = async () => {
    const supabase = supabaseBrowser();
    const response = await supabase
      .from("profiles")
      .update({
        is_aws_s3: false,
        aws_bucket: null,
        aws_access_key_id: null,
        aws_secret_access_key: null,
      })
      .eq("id", user.data?.id ?? "");

    if (response.error) {
      setError("Failed to disconnect. Please try again.");
    } else {
      toast({
        title: "You Disconnected your AWS S3",
        description: (
          <div>
            You have successfully disconnected your AWS S3. You will now your
            Flex storage by default
          </div>
        ),
      });
      setIsConnected(false);
      setBucketName("");
      setAccessKeyId("");
      setSecretAccessKey("");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AWS S3 Connection</h2>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Input
        placeholder="Bucket Name"
        value={bucketName}
        onChange={(e) => setBucketName(e.target.value)}
        disabled={isConnected}
      />
      <Input
        placeholder="AWS Access Key ID"
        value={accessKeyId}
        onChange={(e) => setAccessKeyId(e.target.value)}
        disabled={isConnected}
      />
      <Input
        type="password"
        placeholder="AWS Secret Access Key"
        value={secretAccessKey}
        onChange={(e) => setSecretAccessKey(e.target.value)}
        disabled={isConnected}
      />
      {isConnected ? (
        <Button onClick={handleDisconnect}>Disconnect</Button>
      ) : (
        <Button onClick={handleConnect}>Connect</Button>
      )}
      <Alert>
        <AlertDescription>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm">
              For detailed instructions on secure connection:
            </span>
            <div className="flex space-x-4">
              <a
                href="https://docs.getflex.ai/guides/connect-your-storage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Docs
              </a>
              <a
                href="https://www.loom.com/share/ecf83ed0755044a6b50a3dfda20fceb6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Video
              </a>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
