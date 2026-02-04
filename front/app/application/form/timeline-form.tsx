import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  description: z.string().optional(),
  event_type: z.enum(["system", "manual"]),
  title: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function TimelineForm({
  updateStatus,
  setTimelineOpen,
}: {
  updateStatus: (values: FormValues) => void;
  setTimelineOpen: (open: boolean) => void;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_type: "manual",
      title: "",
      description: "",
    } satisfies Partial<FormValues>,
  });

  const frameworks = [
    "applied",
    "viewed",
    "screening",
    "interviewing",
    "negotiating",
    "offered",
  ];

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateStatus(values);
    setTimelineOpen(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <FormControl>
                <Command className="border">
                  <CommandInput
                    placeholder="Type a stage here…"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />

                  <CommandList>
                    <CommandEmpty>No stages found.</CommandEmpty>

                    {/* Create option when not in presets */}
                    {/* {field.value?.trim() &&
                      !frameworks.includes(field.value.trim()) && (
                        <CommandItem
                          value={field.value.trim()}
                          onSelect={(v) => field.onChange(v)}
                        >
                          Create “{field.value.trim()}”
                        </CommandItem>
                      )} */}

                    <CommandGroup>
                      {frameworks
                        .filter((stage) => field.value !== stage)
                        .map((stage) => (
                          <CommandItem
                            key={stage}
                            value={stage}
                            onSelect={(v) => field.onChange(v)}
                            className="hover:cursor-pointer"
                          >
                            {stage}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter note here ..."
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="col-start-2 mt-6 flex justify-end gap-2">
          <Button
            type="reset"
            onClick={() => form.reset()}
            className="hover:cursor-pointer"
            variant="destructive"
          >
            Reset
          </Button>
          <Button type="submit" className="hover:cursor-pointer">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TimelineForm;
