import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Trash2, Edit, ExternalLink, MapPin, Briefcase, DollarSign, User, FileText } from "lucide-react";
import { toast } from "sonner";

import { ApplicationService } from "../services/applicationService";
import type { Application, ApplicationStatus } from "../types";
import { Button, buttonVariants } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { FieldLabel } from "../components/ui/field";

export default function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | undefined>(undefined);
  const [isNewStatusOpen, setIsNewStatusOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);

  // New Status State
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("Applied");
  const [newStatusDate, setNewStatusDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (id) {
      const app = ApplicationService.getById(id);
      if (app) {
        setApplication(app);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const onAddStatus = () => {
    if (!application) return;
    const updated = ApplicationService.addStatus(application.id, newStatus, newStatusDate);
    setApplication(updated);
    setIsNewStatusOpen(false);
    toast.success("Status history updated!");
  };

  const onDeleteStatus = () => {
    if (!application || !statusToDelete) return;
    try {
        const updated = ApplicationService.deleteStatus(application.id, statusToDelete);
        setApplication(updated);
        toast.success("Status entry deleted.");
    } catch (error) {
        toast.error((error as Error).message);
    } finally {
        setStatusToDelete(null);
    }
  };

  if (!application) return <div>Loading...</div>;

  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
            <Badge variant="outline">
                {currentStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">{application.jobTitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Link to={`/applications/${application.id}/edit`} className={buttonVariants({ variant: "default", size: "sm" })}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Read-only Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Job Title
                        </span>
                        <p className="font-medium">{application.jobTitle}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Company
                        </span>
                        <p className="font-medium">{application.company}</p>
                    </div>
                    {application.salary && (
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Salary
                            </span>
                            <p>{application.salary}</p>
                        </div>
                    )}
                     {application.workType && (
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Work Type
                            </span>
                            <p>{application.workType}</p>
                        </div>
                    )}
                    {application.location && (
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Location
                            </span>
                            <p>{application.location}</p>
                        </div>
                    )}
                    {application.contactInfo && (
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Contact
                            </span>
                            <p>{application.contactInfo}</p>
                        </div>
                    )}
                </div>

                {application.jobDescriptionUrl && (
                    <div className="space-y-1">
                         <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Job Description
                        </span>
                        <a 
                            href={application.jobDescriptionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline break-all"
                        >
                            {application.jobDescriptionUrl}
                        </a>
                    </div>
                )}

                {application.notes && (
                    <div className="space-y-1">
                         <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Notes
                        </span>
                        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
                            {application.notes}
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status History */}
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Status History</CardTitle>
                    {!isNewStatusOpen ? (
                        <Button size="sm" variant="outline" onClick={() => setIsNewStatusOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    ) : (
                        <Button size="sm" variant="ghost" onClick={() => setIsNewStatusOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isNewStatusOpen && (
                        <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4">
                             <h4 className="font-medium text-sm">Add New Status</h4>
                             <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <FieldLabel>Status</FieldLabel>
                                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Applied">Applied</SelectItem>
                                            <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                                            <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                                            <SelectItem value="On-site Interview">On-site Interview</SelectItem>
                                            <SelectItem value="Offer">Offer</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                            <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <FieldLabel>Date</FieldLabel>
                                    <Input type="date" value={newStatusDate} onChange={(e) => setNewStatusDate(e.target.value)} />
                                </div>
                                <Button onClick={onAddStatus} size="sm">Save Status</Button>
                             </div>
                        </div>
                    )}

                    <div className="relative border-l border-muted ml-2 space-y-6">
                        {/* Reverse copy of history to show newest first */}
                        {[...application.statusHistory].reverse().map((entry, index) => (
                            <div key={entry.id} className="ml-4 relative group">
                                <div className={`absolute -left-5.25 mt-1.5 h-2.5 w-2.5 rounded-full border border-background ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm">{entry.status}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(entry.date).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    {application.statusHistory.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                            onClick={() => setStatusToDelete(entry.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <AlertDialog open={!!statusToDelete} onOpenChange={(open) => !open && setStatusToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Status Entry?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this status entry? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteStatus} className="bg-destructive text-(--destructive-foreground) hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
