import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransationType } from "@/lib/types";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { toast } from "sonner";
import { DeleteCategory } from "../_actions/categories";

function DeleteCategoryDialog({
  trigger,
  category,
}: {
  trigger: ReactNode;
  category: Category;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: DeleteCategory,
    onSuccess: async () => {
      toast.success(`Deleted category ${category.name} successfully`, {
        id: `${category.name}-${category.type}`,
      });

      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },

    onError: () => {
      toast.error("Failed to delete category", {
        id: `${category.name}-${category.type}`,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are your absolutelt sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            category.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting category...", {
                id: `${category.name}-${category.type}`,
              });
              deleteMutation.mutate({
                name: category.name,
                type: category.type as TransationType,
              });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategoryDialog;
