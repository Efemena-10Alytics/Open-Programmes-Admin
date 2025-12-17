"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/utils/axios";
import { Loader2, Link2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  communityLink: z
    .string()
    .min(1, { message: "Community link is required." })
    .url({ message: "Please enter a valid URL." }),
});

export function UpdateCommunityLinkModal() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState<{
    title: string;
    description: string;
    variant: "default" | "destructive";
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityLink: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setAlert(null);
      
      const response = await axiosInstance.put("/api/admin/community-link", values);
      
      if (response.status === 200) {
        setAlert({
          title: "Success",
          description: "Community link updated successfully!",
          variant: "default"
        });
        
        setTimeout(() => {
          setOpen(false);
          setAlert(null);
          form.reset();
        }, 2000);
      }
    } catch (error: any) {
      setAlert({
        title: "Error",
        description: error.response?.data?.error || "Failed to update community link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
    setAlert(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-2 h-4 w-4" />
          Update Community Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Update Community Link
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {alert && (
              <Alert variant={alert.variant}>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="communityLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Link URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://whats.gg/your-community-link" 
                      {...field}
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-muted-foreground">
                    Enter the URL for your community platform (WhatsApp, etc.)
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Updating..." : "Update Link"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}