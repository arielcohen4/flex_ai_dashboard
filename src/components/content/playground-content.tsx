"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Loader2, Edit2, Check } from "lucide-react";
import useUser from "@/app/hook/useUser";
import { Tables } from "@/lib/types/supabase";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  id?: number;
}

export default function LLMPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    (Tables<"endpoints"> & { base_model: Tables<"models"> }) | null
  >(null);
  const [selectedLoraCheckpoint, setSelectedLoraCheckpoint] =
    useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const user = useUser();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);
  const systemPromptInputRef = useRef<HTMLTextAreaElement>(null);

  const endpointsQuery = useQuery({
    queryKey: ["endpoints_count_change"],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data } = await supabase
          .from("endpoints")
          .select(
            `
            *,
            base_model:models!base_model_id(*)
          `
          )
          .order("created_at", { ascending: false });

        return data ?? [];
      }
    },
  });

  const handleEndpointChange = (endpointId: string) => {
    const endpoint =
      endpointsQuery.data?.find((e) => e.id === endpointId) || null;
    setSelectedEndpoint(
      endpoint as
        | (Tables<"endpoints"> & { base_model: Tables<"models"> })
        | null
    );
    setSelectedLoraCheckpoint("");
  };

  const handleLoraCheckpointChange = (checkpointName: string) => {
    setSelectedLoraCheckpoint(checkpointName);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSystemPromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSystemPrompt(e.target.value);
  };

  const handleSystemPromptEdit = () => {
    setIsEditingSystemPrompt(true);
    setTimeout(() => {
      if (systemPromptInputRef.current) {
        systemPromptInputRef.current.focus();
      }
    }, 0);
  };

  const handleSystemPromptSave = () => {
    setIsEditingSystemPrompt(false);
    if (systemPromptInputRef.current) {
      setSystemPrompt(systemPromptInputRef.current.value);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!selectedEndpoint || !userInput.trim()) return;

    if (selectedEndpoint.type === "LORA" && !selectedLoraCheckpoint) {
      return;
    }

    setIsModelLoading(false);
    setIsLoading(true);
    const newUserMessage = {
      role: "user" as const,
      content: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory((prev) => [...prev, newUserMessage]);

    timerRef.current = setTimeout(() => {
      setIsModelLoading(true);
    }, 3000);

    const openai = new OpenAI({
      apiKey: user.data?.api_key,
      baseURL: selectedEndpoint.url + "/v1",
      dangerouslyAllowBrowser: true,
    });

    try {
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatHistory,
        newUserMessage,
      ];

      const stream = await openai.chat.completions.create({
        model:
          selectedEndpoint.type === "LORA"
            ? selectedLoraCheckpoint
            : (selectedEndpoint.model_name as string),
        messages: messages.map(({ role, content }) => ({
          role: role as "system" | "user" | "assistant",
          content,
        })),
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stream: true,
      });

      let accumulatedResponse = "";

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      for await (const chunk of stream) {
        setIsModelLoading(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        const content = chunk.choices[0]?.delta?.content || "";
        accumulatedResponse += content;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = accumulatedResponse;
          return newHistory;
        });
      }
    } catch (error) {
      setIsModelLoading(false);
      console.error("Error calling LLM:", error);
      // Remove the loading indicator and add an error message
    } finally {
      setIsModelLoading(false);
      setIsLoading(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    setUserInput("");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  console.log(selectedEndpoint);

  const isInputDisabled =
    !selectedEndpoint ||
    (selectedEndpoint.type === "LORA" && !selectedLoraCheckpoint);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">LLM Playground</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <strong>System Prompt:</strong>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={
                    isEditingSystemPrompt
                      ? handleSystemPromptSave
                      : handleSystemPromptEdit
                  }
                >
                  {isEditingSystemPrompt ? (
                    <Check size={16} />
                  ) : (
                    <Edit2 size={16} />
                  )}
                </Button>
              </div>
              {isEditingSystemPrompt ? (
                <Textarea
                  ref={systemPromptInputRef}
                  defaultValue={systemPrompt}
                  onChange={handleSystemPromptChange}
                  rows={3}
                  className="w-full mt-2"
                />
              ) : (
                <div className="p-2 bg-secondary rounded">{systemPrompt}</div>
              )}
            </div>
            <div
              ref={chatContainerRef}
              className="space-y-4 h-[400px] overflow-y-auto mb-4"
            >
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.role === "user" ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong>
                      {message.role === "user" ? "User:" : "Assistant:"}
                    </strong>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  {message.content}
                </div>
              ))}
              {isModelLoading && (
                <div className="flex items-center justify-center p-4 rounded mb-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>
                    Loading the model and warming up the GPU. This may take a
                    moment...
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  isInputDisabled
                    ? "Select an endpoint and LORA checkpoint (if applicable)"
                    : "Type your message..."
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && !isInputDisabled && handleSubmit()
                }
                disabled={isLoading || isInputDisabled}
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || isInputDisabled}
              >
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
                    <SelectItem
                      key={selectedEndpoint.base_model.name}
                      value={selectedEndpoint.base_model.name}
                    >
                      {selectedEndpoint.base_model.name}
                    </SelectItem>
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
