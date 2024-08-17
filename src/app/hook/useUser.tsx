"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const initUser = {
  created_at: "",
  display_name: "",
  email: "",
  id: "",
  image_url: "",
  api_key: "",
  balance: 0,
  aws_access_key_id: "",
  aws_secret_access_key: "",
  aws_bucket: "",
  is_aws_s3: false,
};

export default function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // fetch user information profile
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        return user;
      }
      return initUser;
    },
  });
}
