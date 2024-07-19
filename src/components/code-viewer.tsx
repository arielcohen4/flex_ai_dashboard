import useUser from "@/app/hook/useUser";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tables } from "@/lib/types/supabase";

export function CodeViewer({ model }: {model: Tables<"models">}) {
  const user = useUser()

  if (!user.data) {
    return <div>Loading...</div>
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">View code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>View code</DialogTitle>
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
                  <span className="text-sky-300">from</span> flex_ai <span className="text-sky-300">import</span> FlexAI, DatasetType
                </span>
                <span />
                <span>
                  client = FlexAI(api_key=
                  <span className="text-green-300">
                    {`"${user.data.api_key}"`}
                  </span>
                  )
                </span>
                <span />
                <span>
                  client.create_finetune(name=
                  <span className="text-amber-300">&quot;My Task New&quot;</span>, 
                </span>
                <span>
                  {" "}
                  dataset_id=
                  <span className="text-green-300">&quot;DATASET_ID&quot;</span>,
                </span>
                <span>
                  {" "}
                  model=
                  <span className="text-green-300">{`"${model.name}"`}</span>,
                </span>
                <span>
                  {" "}
                  n_epochs=<span className="text-amber-300">5</span>, 
                </span>
                <span>
                  {" "}
                  train_with_lora=<span className="text-amber-300">True</span>,
                </span>
                <span>
                  {" "}
                  lora_config={"{"}
                </span>
                <span>
                  {"    "}
                  lora_r=<span className="text-amber-300">16</span>, lora_alpha=<span className="text-amber-300">8</span>, lora_dropout=<span className="text-amber-300">0.1</span>
                </span>
                <span>
                  {"  }"}, 
                </span>
                <span>
                  {" "}
                  n_checkpoints_and_evaluations_per_epoch=<span className="text-amber-300">1</span>)
                </span>
              </code>
            </pre>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Your API Key can be found here. You should use environment
              variables or a secret management tool to expose your key to your
              applications.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}