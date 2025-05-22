"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Channel name must be at least 2 characters long" })
    .max(32, { message: "Channel name cannot be longer than 32 characters" })
    .refine((name) => !name.includes(" "), { message: "Channel name cannot contain spaces" }),
  description: z.string().max(255, { message: "Description cannot be longer than 255 characters" }).optional(),
  isPrivate: z.boolean().default(false),
});

type CreateChannelFormValues = z.infer<typeof createChannelSchema>;

interface CreateChannelFormProps {
  onSuccess?: () => void;
}

export function CreateChannelForm({ onSuccess }: CreateChannelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  async function onSubmit(values: CreateChannelFormValues) {
    setIsSubmitting(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("You must be logged in to create a channel");
      }
      
      // Create channel
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .insert({
          name: values.name,
          description: values.description || "",
          is_private: values.isPrivate,
          created_by: userData.user.id,
        })
        .select()
        .single();
      
      if (channelError) throw channelError;
      
      // Add creator as channel member with owner role
      await supabase
        .from('channel_members')
        .insert({
          channel_id: channelData.id,
          user_id: userData.user.id,
          role: 'owner',
        });
      
      toast({
        title: "Channel created",
        description: `#${values.name} has been created successfully.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error creating channel",
        description: (error as Error).message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. announcements" 
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>
                Channel names cannot contain spaces. Use hyphens instead.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is this channel about?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Private channel</FormLabel>
                <FormDescription>
                  Private channels are only visible to their members
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              "Create Channel"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}