"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Button } from "../ui/button";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  role: z.string().min(2).max(50),
  working_at: z.string().min(2).max(50),
  linkedin_url: z.url().optional(),
  email: z.email().optional(),
  phone: z
    .string()
    .min(10, { message: "Must be a valid mobile number" })
    .max(14, { message: "Must be a valid mobile number" })
    .optional(),
  location: z.string().min(2).max(50).optional(),
  note: z.string().optional().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function RecruiterForm() {
  const router = useRouter();

  // 1. Define a form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      working_at: "",
      linkedin_url: "",
      email: "",
      phone: "",
      location: "",
      note: "",
    } satisfies Partial<FormValues>,
  });

  async function createRecruiter(values: z.infer<typeof formSchema>) {
    const res = await fetch("http://localhost:4000/api/recruiter/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(createRecruiter(values), {
        loading: "Creating recruiter…",
        success: () => {
          router.push("/");
          return `Recruiter profile created: ${values.name} · ${values.working_at}`;
        },
        error: (e) => e.message,
      });
    } catch (e) {
      console.error("Error:", e);
    }
  }

  return (
    <div className="m-auto flex w-4/5 max-w-4xl min-w-xl flex-col justify-center gap-4 py-6">
      <div>
        <h2 className="self-center py-6 text-2xl font-semibold capitalize">
          Recruiter Form
        </h2>
      </div>
      <div className="border border-black/10 p-6 shadow-2xl">
        <Form {...form}>
          <form
            className="row-auto grid grid-cols-2 gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Recruiter Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Recruiter Name<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name here ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recruiter Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g: Tech Recruiter, Senior Software Engineer, etc"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recruiter workplace */}
            <FormField
              control={form.control}
              name="working_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recruiter location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recruiter linkedin url */}
            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Linked URL<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recruiter email address */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recruiter phone number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recruiter Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      className="max-h-52 min-h-24 resize-y"
                      placeholder="Paste a short summary..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-start-2 mt-6 flex justify-end gap-2">
              <Button
                type="reset"
                onClick={() => {
                  form.reset();
                  router.push("/jobs ");
                }}
                className="hover:cursor-pointer"
                variant={"destructive"}
              >
                Cancel
              </Button>
              <Button type="submit" className="hover:cursor-pointer">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default RecruiterForm;
