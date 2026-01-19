import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ApplicationService } from "../services/applicationService";
import type { Application, WorkType } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
    FieldSet,
} from "../components/ui/field";

const applicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescriptionUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  salary: z.string().optional(),
  location: z.string().optional(),
  workType: z.enum(["Remote", "Hybrid", "On-site"] as [string, ...string[]]).optional(),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (id) {
      const app = ApplicationService.getById(id);
      if (app) {
        setApplication(app);
        reset({
          company: app.company,
          jobTitle: app.jobTitle,
          jobDescriptionUrl: app.jobDescriptionUrl || "",
          salary: app.salary || "",
          location: app.location || "",
          workType: app.workType,
          contactInfo: app.contactInfo || "",
          notes: app.notes || "",
        });
      } else {
        navigate("/");
      }
    }
  }, [id, navigate, reset]);

  const onUpdateDetails = (data: ApplicationFormValues) => {
    if (!application) return;
    
    ApplicationService.update(application.id, {
        company: data.company,
        jobTitle: data.jobTitle,
        jobDescriptionUrl: data.jobDescriptionUrl || undefined,
        salary: data.salary || undefined,
        location: data.location || undefined,
        workType: data.workType as WorkType | undefined,
        contactInfo: data.contactInfo || undefined,
        notes: data.notes || undefined,
    });
    
    toast.success("Details updated successfully!");
    navigate(`/applications/${application.id}`);
  };

  if (!application) return <div>Loading...</div>;

  const currentWorkType = watch("workType");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/applications/${application.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Application</h1>
          <p className="text-muted-foreground">{application.company}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Update application information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUpdateDetails)} className="space-y-6">
                <FieldSet>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="company">Company</FieldLabel>
                            <Input id="company" {...register("company")} />
                            <FieldError errors={[errors.company]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                            <Input id="jobTitle" {...register("jobTitle")} />
                            <FieldError errors={[errors.jobTitle]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="jobDescriptionUrl">Job Description URL</FieldLabel>
                            <Input id="jobDescriptionUrl" {...register("jobDescriptionUrl")} />
                            <FieldError errors={[errors.jobDescriptionUrl]} />
                        </Field>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="salary">Salary</FieldLabel>
                                <Input id="salary" {...register("salary")} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="location">Location</FieldLabel>
                                <Input id="location" {...register("location")} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Field>
                                <FieldLabel>Work Type</FieldLabel>
                                <Select
                                    value={currentWorkType}
                                    onValueChange={(value) => setValue("workType", value as WorkType, { shouldDirty: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select work type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="contactInfo">Contact Info</FieldLabel>
                                <Input id="contactInfo" {...register("contactInfo")} />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                            <Textarea id="notes" className="min-h-[150px]" {...register("notes")} />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => navigate(`/applications/${application.id}`)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!isDirty || isSubmitting}>
                        Save Changes
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}