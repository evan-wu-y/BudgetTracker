"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from "@/schema/category";
import emojiData from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleOffIcon, Loader2Icon, PlusSquareIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateCategory } from "../_actions/categories";

function CreateCategoryDialog({
  type,
  successCB,
  trigger,
}: {
  type: TransationType;
  successCB: (category: Category) => void;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      type,
    },
  });

  const queryClient = useQueryClient();

  const { theme } = useTheme();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });
      toast.success(`Created category ${data.name} successfully`, {
        id: "create-category",
      });

      successCB(data);

      await queryClient.invalidateQueries({
        queryKey: ["categories", type],
      });

      setOpen(false);
    },

    onError: () => {
      toast.error("Failed to create category", {
        id: "create-category",
      });
    },
  });

  const onSubmit = useCallback(
    (data: CreateCategorySchemaType) => {
      toast.loading("Creating category...", {
        id: "create-category",
      });
      mutate(data);
    },
    [mutate],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={"ghost"}
            className="flex border-separate items-center justify-start rounded-none border-b p-3 text-muted-foreground"
          >
            <PlusSquareIcon className="mr-2 h-4 w-4" />
            Create New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {type}
            </span>
            category
          </DialogTitle>
          <DialogDescription>
            Categories are used to group your transations
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name={"name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Category" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is how your categoty whill appear in the app
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"icon"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="h-[100px] w-full"
                        >
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-5xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Click to Change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOffIcon className="h-[48px] w-[48px]" />
                              <p className="text-xs text-muted-foreground">
                                Click to Select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <EmojiPicker
                          data={emojiData}
                          onEmojiSelect={(emoji: { native: string }) =>
                            field.onChange(emoji.native)
                          }
                          theme={theme}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    This is how your category will appear in the app
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"secondary"} onClick={() => form.reset()}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {!isPending ? "Create" : <Loader2Icon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCategoryDialog;
