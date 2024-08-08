import useUser from "@/app/hook/useUser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tables } from "@/lib/types/supabase";

export function ApiViewer({ endpoint }: { endpoint: Tables<"endpoints"> }) {
  const user = useUser();

  if (!user.data) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">API code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>API code</DialogTitle>
          <DialogDescription>
            You can use the following code to start integrating your current
            prompt and settings into your application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md bg-black p-6">
            <pre>
              <code className="grid gap-1 text-sm text-muted-foreground [&_span]:h-4">
                <span>
                  <span className="text-sky-300">import</span> OpenAI{" "}
                  <span className="text-sky-300">from</span>{" "}
                  <span className="text-green-300">'openai'</span>;
                </span>
                <span />
                <span>
                  <span className="text-sky-300">const</span> openai ={" "}
                  <span className="text-sky-300">new</span> OpenAI({"{"}
                </span>
                <span>
                  {" "}
                  apiKey:{" "}
                  <span className="text-green-300">{`'${user.data.api_key}'`}</span>
                </span>
                <span>
                  {" "}
                  baseURL:{" "}
                  <span className="text-green-300">{`'${endpoint.url}/v1'`}</span>
                </span>
                <span>{"}"});</span>
                <span />
                <span>
                  {" "}
                  <span className="text-sky-300">const</span> completion ={" "}
                  <span className="text-sky-300">await</span>{" "}
                  openai.completions.create({"{"}
                </span>
                <span>
                  {" "}
                  model:{" "}
                  <span className="text-green-300">
                    {`'${(endpoint.lora_checkpoints as any[])[0].name}'`}
                  </span>
                  ,
                </span>
                <span>
                  {" "}
                  prompt:{" "}
                  <span className="text-green-300">
                    'Translate the following English text to Fre
                  </span>
                  ,
                </span>
                <span>
                  {" "}
                  max_tokens: <span className="text-amber-300">60</span>
                </span>
                <span> {"}"});</span>
                <span />
                <span>
                  {" "}
                  console.log(completion.choices[
                  <span className="text-amber-300">0</span>].text);
                </span>
              </code>
            </pre>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {`Remember to replace '${user.data.api_key}' with your actual OpenAI
              API key and update the custom URL if necessary. Always use
              environment variables or a secure secret management system in
              production.`}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
