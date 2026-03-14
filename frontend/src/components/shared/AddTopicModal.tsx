"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Plus } from "lucide-react";


const topicSchema = z.object({
  title: z.string().min(5, "Topic should be greater than 5 character..!"),
  short_note: z.string().optional(),
});

export default function AddTopicModal({ onPostCreated }: { onPostCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(topicSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post("/create-post", data);
      
      reset();
      setOpen(false);
      onPostCreated();
    } catch (err) {
      alert("AI response failed, pls try again..!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/20">
          <Plus className="mr-2 h-4 w-4" /> Add New Topic
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="text-blue-400 h-5 w-5" /> What did you learn?
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-zinc-400">Topic Name</label>
            <Input 
              {...register("title")}
              placeholder="e.g. Docker Networking, Quantum Computing"
              className="bg-zinc-800 border-zinc-700 mt-1 focus:ring-blue-500"
              disabled={loading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{String(errors.title.message)}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Short Note (Optional)</label>
            <Textarea 
              {...register("short_note")}
              placeholder="Iske bare mein koi specific baat?"
              className="bg-zinc-800 border-zinc-700 mt-1 resize-none h-24"
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is Researching...
              </>
            ) : (
              "Generate AI Research"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}