"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createCheckout } from "@/lib/actions/payment";
import { formatDistance } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import useUser from "@/app/hook/useUser";
import TrackService from "@/lib/client-services/track";

const BillingContent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState(10);
  const [error, setError] = useState("");
  const supabase = supabaseBrowser();
  const user = useUser();

  // Fetch payments using React Query
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments", "billing-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "PAID")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAmount(value);

    if (value < 10) {
      setError("Minimum amount is $10");
    } else if (value > 1000) {
      setError("Maximum amount is $1000");
    } else {
      setError("");
    }
  };

  const handleCheckout = async () => {
    if (amount < 10 || amount > 1000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between $10 and $1000",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      TrackService.send({
        name: "checkout_started",
        properties: { amount },
      });
      const response = await createCheckout({ amount });
      (window as any).LemonSqueezy.Url.Open(response.data.attributes.url);
      setIsProcessing(false);
    } catch (error) {
      TrackService.send({
        name: "checkout_failed",
        properties: { amount },
      });
      setIsProcessing(false);
      console.error("Failed to open checkout overlay:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Balance
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-bold">${user.data?.balance}</p>
          )}
        </CardContent>
      </Card>

      {/* Add Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount to Add ($)
              </label>
              <Input
                id="amount"
                type="number"
                min={10}
                max={1000}
                value={amount}
                onChange={handleAmountChange}
                className="w-full"
                placeholder="Enter amount"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={isProcessing || !!error || amount < 10 || amount > 1000}
            >
              {isProcessing ? "Processing..." : `Pay $${amount}`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Secure payment powered by Lemon Squeezy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment History
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !payments || payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No payment history yet
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(
                        new Date(payment.created_at),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingContent;
