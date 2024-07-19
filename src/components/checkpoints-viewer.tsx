import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TaskWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatSize } from '@/lib/utils';

const REMOVE_LOGS_KEYS = ['step', 'epoch', 'eval_runtime', 'eval_steps_per_second', 'eval_samples_per_second'];

export function CheckpointsViewer({ task, isOpen, onClose }: { task: TaskWithRelations, isOpen: boolean, onClose: () => void }) {
  const checkpointsQuery = useQuery({
    queryKey: ["checkpoints", task.id],
    queryFn: async () => {
      const supabase = supabaseBrowser();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const { data, error } = await supabase
          .from('checkpoints')
          .select('*')
          .eq("task_id", task.id)
          .order('created_at', { ascending: true });
        return data ?? [];
      }
      return [];
    } 
  });

  const downloadCheckpoint = ({id}: {id:string}) => {
    return
  };

  console.log(checkpointsQuery?.data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Checkpoints for {task.name}</DialogTitle>
          <DialogDescription>
            View details of saved checkpoints for this fine-tuning task.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Epoch</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkpointsQuery.data?.map((checkpoint, index) => (
                <TableRow key={checkpoint.id}>
                  <TableCell>{checkpoint.step}</TableCell>
                  <TableCell>{(checkpoint.step / task.total_steps * ((task.config as { num_epochs: number }).num_epochs)).toFixed(2)}</TableCell>
                  <TableCell>{formatSize(checkpoint.size)}</TableCell>
                  <TableCell>{checkpoint.type === 'LORA' ? 'LoRA' : 'Regular'}</TableCell>
                  <TableCell>
                    {checkpoint?.logs && Object.entries(checkpoint.logs as Record<string, string | number>).map(([key, value]) => {
                      if  (!REMOVE_LOGS_KEYS.includes(key)) {
                        return <Badge key={key} variant="secondary" className="mr-1 mb-1">
                        {key}: {typeof value === 'number' ? value.toFixed(4) : value}
                      </Badge>
                      }
                    })}
                  </TableCell>
                  <TableCell><Button variant="secondary" onClick={() => downloadCheckpoint({ id: checkpoint.id })}>Download</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}