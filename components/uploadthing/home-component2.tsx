"use client"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { FileUpload } from "./file-uploader";
import { Axis3DIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MultipleFileUpload } from "./multiple-file-uploader";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.array(z.object({ url: z.string() })),
});

const InitialModal2 = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: []
      //If there is initial data
    //   imageUrl: [
    //         {url: "https://utfs.io/f/f3156a89-67f7-4fb7-aa4c-9850cb17a411-5kftil.jpeg"},
    //         {url: "https://utfs.io/f/26a876c5-7530-44e8-89db-b9a781ec2ad0-jv1jpr.jpeg"}
    //   ],
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/servers", values);
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customise your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image, you can always change it later
          </DialogDescription>

          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-8">
                  <div className="flex items-center justify-center text-center">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MultipleFileUpload
                              endpoint="imageUploader"
                              //@ts-ignore
                              value={field.value.map((image: { url: string }) => image.url)}
                              onChange={(urls: string[]) =>
                                field.onChange(urls.map((url) => ({ url })))
                              }
                              onRemove={(url) =>
                                //@ts-ignore
                                field.onChange(field.value.filter((current) => current.url !== url))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase font-bold text-zinc-500 dark:text-secondary/70">
                        Server name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter server name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="bg-gray-100 px-6 py-4">
                  <Button disabled={isLoading} variant={"default"} type="submit">
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModal2;
