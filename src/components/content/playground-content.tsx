"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import OpenAI from "openai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import useUser from "@/app/hook/useUser";
import { Tables } from "@/lib/types/supabase";

export default function LLMPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<Tables<"endpoints"> | null>(null);
  const [selectedLoraCheckpoint, setSelectedLoraCheckpoint] =
    useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const user = useUser();

  const endpointsQuery = useQuery({
    queryKey: ["endpoints_count"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data } = await supabase
          .from("endpoints")
          .select(`*, models(*)`)
          .order("created_at", { ascending: false });
        return data ?? [];
      }
    },
  });

  const handleEndpointChange = (endpointId: string) => {
    const endpoint =
      endpointsQuery.data?.find((e) => e.id === endpointId) || null;
    setSelectedEndpoint(endpoint);
    setSelectedLoraCheckpoint("");
  };

  const handleLoraCheckpointChange = (checkpointName: string) => {
    setSelectedLoraCheckpoint(checkpointName);
  };

  const handleSubmit = async () => {
    if (!selectedEndpoint || !userInput.trim()) return;

    if (selectedEndpoint.type === "LORA" && !selectedLoraCheckpoint) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error: Please select a LORA checkpoint before sending a message.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    const newUserMessage = { role: "user" as const, content: userInput };
    setChatHistory((prev) => [...prev, newUserMessage]);

    const openai = new OpenAI({
      apiKey: "ed8ef09e-3ca0-4080-bd93-761fa5428d65",
      baseURL: selectedEndpoint.url + "/v1",
      dangerouslyAllowBrowser: true,
    });

    try {
      const stream = await openai.chat.completions.create({
        model:
          selectedEndpoint.type === "LORA"
            ? selectedLoraCheckpoint
            : (selectedEndpoint.model_name as string),
        messages: [...chatHistory, newUserMessage],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stream: true,
      });

      let accumulatedResponse = "";
      setChatHistory((prev) => [...prev, { role: "assistant", content: "" }]);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        accumulatedResponse += content;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = accumulatedResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Error calling LLM:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Unable to get response from the model.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }

    setUserInput("");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">LLM Playground</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[400px] overflow-y-auto mb-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.role === "user" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <strong>{message.role === "user" ? "You:" : "AI:"}</strong>{" "}
                  {message.content}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isLoading}
              />
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleEndpointChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an Endpoint" />
              </SelectTrigger>
              <SelectContent>
                {endpointsQuery.data?.map((endpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.id}>
                    {endpoint.name.split("_")[1]} ({endpoint.stage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEndpoint?.type === "LORA" &&
              selectedEndpoint.lora_checkpoints != null &&
              Array.isArray(selectedEndpoint.lora_checkpoints) &&
              selectedEndpoint.lora_checkpoints.length > 0 && (
                <Select onValueChange={handleLoraCheckpointChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lora" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedEndpoint.lora_checkpoints as any[])?.map(
                      (c: any, index: number) => (
                        <SelectItem key={index} value={c.name}>
                          {c.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Temperature: {temperature}
              </label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                max={2}
                step={0.1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Tokens: {maxTokens}
              </label>
              <Slider
                value={[maxTokens]}
                onValueChange={(value) => setMaxTokens(value[0])}
                max={4096}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Top P: {topP}
              </label>
              <Slider
                value={[topP]}
                onValueChange={(value) => setTopP(value[0])}
                max={1}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency Penalty: {frequencyPenalty}
              </label>
              <Slider
                value={[frequencyPenalty]}
                onValueChange={(value) => setFrequencyPenalty(value[0])}
                max={2}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Presence Penalty: {presencePenalty}
              </label>
              <Slider
                value={[presencePenalty]}
                onValueChange={(value) => setPresencePenalty(value[0])}
                max={2}
                step={0.01}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
