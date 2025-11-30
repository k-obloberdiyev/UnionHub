import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const memberSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  class_name: z.string().trim().min(1, { message: "Class is required" }),
  biography: z.string().trim().optional().default(""),
  avatar: z.string().trim().url().optional().or(z.literal("")).default(""),
  password: z.string().min(6),
  confirm: z.string().min(6),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

interface AddMemberDialogProps {
  departmentCode: number;
  onCreated?: () => void;
}

export default function AddMemberDialog({ departmentCode, onCreated }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      class_name: "",
      biography: "",
      avatar: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof memberSchema>) => {
    try {
      const nameParts = values.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const payload: any = {
        name: values.name,
        first_name: firstName,
        last_name: lastName,
        email: values.email,
        emailVisibility: true,
        avatar: values.avatar || null,
        department_code: departmentCode,
        class_name: values.class_name,
        biography: values.biography || "",
        password: values.password,
        passwordConfirm: values.confirm,
      };

      const { error } = await supabase.from("profiles").insert(payload);
      if (error) throw error;

      toast({ title: "Member added", description: `${values.name} has been created.` });
      setOpen(false);
      form.reset();
      onCreated?.();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to add member", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">Add Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to Department {departmentCode}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...form.register("name")} placeholder="Jane Doe" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="jane@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_name">Class</Label>
            <Input id="class_name" {...form.register("class_name")} placeholder="Business 2027" />
            {form.formState.errors.class_name && (
              <p className="text-xs text-destructive">{form.formState.errors.class_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biography</Label>
            <Textarea id="biography" {...form.register("biography")} placeholder="Short biography..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" {...form.register("avatar")} placeholder="https://..." />
            {form.formState.errors.avatar && (
              <p className="text-xs text-destructive">{form.formState.errors.avatar.message as any}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" {...form.register("confirm")} />
              {form.formState.errors.confirm && (
                <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
