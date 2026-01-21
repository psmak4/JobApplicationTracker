import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Application } from "../types";
import { Badge } from "../components/ui/badge";
import { Button, buttonVariants } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useApplications, useDeleteApplication } from "../hooks/useApplications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
} from "../components/ui/alert-dialog";
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown, X, Filter as FilterIcon, Eye, Plus } from "lucide-react";
import { cn, formatDisplayDate } from "../lib/utils";
import { toast } from "sonner";

type SortKey = "company" | "status" | "updatedAt";
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface FilterConfig {
  company: string;
  status: string; // "all" or specific status
  daysAgo: string; // "all", "7", "14", "30"
}

interface SortIconProps {
  columnKey: SortKey;
  sortConfig: SortConfig;
}

const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
  return sortConfig.direction === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  );
};

export default function Dashboard() {
  const { data: applications = [], isLoading, error } = useApplications();
  const deleteMutation = useDeleteApplication();
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "updatedAt",
    direction: "desc",
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    company: "",
    status: "all",
    daysAgo: "all",
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Application deleted");
    } catch (err) {
      toast.error("Failed to delete application");
    }
  };

  const getCurrentStatus = (app: Application) => {
    if (!app.statusHistory || app.statusHistory.length === 0) return "Unknown";
    return app.statusHistory[0].status; // Backend sorts history by date desc
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Offer":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400";
      case "Rejected":
        return "destructive";
      case "Withdrawn":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStalenessColor = (updatedAt: string, status: string) => {
    const isInactive = ["Offer", "Rejected", "Withdrawn"].includes(status);
    if (isInactive) return "text-muted-foreground";

    const daysSinceUpdate = (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 3600 * 24);

    if (daysSinceUpdate > 14) return "text-red-500 font-medium";
    if (daysSinceUpdate > 7) return "text-yellow-600 font-medium";
    return "text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // Filter
    if (filterConfig.company) {
      const query = filterConfig.company.toLowerCase();
      result = result.filter((app) =>
        app.company.toLowerCase().includes(query)
      );
    }

    if (filterConfig.status !== "all") {
      result = result.filter(
        (app) => getCurrentStatus(app) === filterConfig.status
      );
    }

    if (filterConfig.daysAgo !== "all") {
      const days = parseInt(filterConfig.daysAgo);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(
        (app) => new Date(app.updatedAt) >= cutoffDate
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortConfig.key) {
        case "company":
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
          break;
        case "status":
          valA = getCurrentStatus(a);
          valB = getCurrentStatus(b);
          break;
        case "updatedAt":
          valA = new Date(a.updatedAt).getTime();
          valB = new Date(b.updatedAt).getTime();
          break;
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, sortConfig, filterConfig]);

  if (isLoading) return <div className="p-8 text-center">Loading applications...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error loading applications</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your job applications.
          </p>
        </div>
        <Link to="/applications/new" className={cn(buttonVariants(), "w-full sm:w-auto")}>
          <Plus className="mr-2 h-4 w-4" /> New Application
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / Filters */}
        <aside className={cn("w-full md:w-64 flex-none space-y-4", isFiltersOpen ? "block" : "hidden md:block")}>
             <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FilterIcon className="h-4 w-4" /> Filters
                </h3>
                
                <div className="space-y-2">
                    <label htmlFor="company-filter" className="text-sm font-medium leading-none">Company</label>
                    <Input
                        id="company-filter"
                        placeholder="Search..."
                        value={filterConfig.company}
                        onChange={(e) =>
                        setFilterConfig((prev) => ({ ...prev, company: e.target.value }))
                        }
                        className="h-9 w-full bg-background"
                    />
                </div>
                
                <div className="space-y-2">
                    <label id="status-filter-label" className="text-sm font-medium leading-none">Status</label>
                    <Select
                        value={filterConfig.status}
                        onValueChange={(val) =>
                        setFilterConfig((prev) => ({ ...prev, status: val || "all" }))
                        }
                    >
                        <SelectTrigger aria-labelledby="status-filter-label" className="h-9 w-full bg-background">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
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
                
                <div className="space-y-2">
                    <label id="updated-filter-label" className="text-sm font-medium leading-none">Last Updated</label>
                    <Select
                        value={filterConfig.daysAgo}
                        onValueChange={(val) =>
                        setFilterConfig((prev) => ({ ...prev, daysAgo: val || "all" }))
                        }
                    >
                        <SelectTrigger aria-labelledby="updated-filter-label" className="h-9 w-full bg-background">
                            <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any time</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(filterConfig.company || filterConfig.status !== 'all' || filterConfig.daysAgo !== 'all') && (
                    <Button 
                        variant="ghost" 
                        onClick={() => setFilterConfig({ company: "", status: "all", daysAgo: "all" })}
                        className="w-full h-9"
                    >
                        Reset Filters
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
             {/* Mobile Toggle Button */}
             <div className="md:hidden mb-4">
                <Button onClick={() => setIsFiltersOpen(!isFiltersOpen)} variant="outline" className="w-full">
                   <FilterIcon className="mr-2 h-4 w-4" />
                   {isFiltersOpen ? "Hide Filters" : "Show Filters"}
                </Button>
             </div>

             <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => toggleSort("company")}
                        >
                            Company
                            <SortIcon columnKey="company" sortConfig={sortConfig} />
                        </Button>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Job Title
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => toggleSort("status")}
                        >
                            Status
                            <SortIcon columnKey="status" sortConfig={sortConfig} />
                        </Button>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => toggleSort("updatedAt")}
                        >
                            Last Updated
                            <SortIcon columnKey="updatedAt" sortConfig={sortConfig} />
                        </Button>
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                    {filteredAndSortedApplications.length === 0 ? (
                        <tr>
                        <td colSpan={5} className="h-24 text-center">
                            No applications found matching your criteria.
                        </td>
                        </tr>
                    ) : (
                        filteredAndSortedApplications.map((app) => {
                        const currentStatus = getCurrentStatus(app);
                        return (
                            <tr
                            key={app.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                            <td className="p-4 align-middle font-medium">{app.company}</td>
                            <td className="p-4 align-middle">{app.jobTitle}</td>
                            <td className="p-4 align-middle">
                                <Badge variant={getStatusColor(currentStatus) as "default" | "destructive" | "secondary" | "outline"} className={getStatusColor(currentStatus) !== "destructive" && getStatusColor(currentStatus) !== "secondary" && getStatusColor(currentStatus) !== "outline" ? getStatusColor(currentStatus) : ""}>
                                {currentStatus}
                                </Badge>
                            </td>
                            <td className={`p-4 align-middle ${getStalenessColor(app.updatedAt, currentStatus)}`}>
                                {formatDate(app.updatedAt)}
                            </td>
                            <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                <Link to={`/applications/${app.id}`} className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                </Link>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-destructive hover:text-destructive")}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will permanently delete the application for <strong>{app.company}</strong>. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(app.id)} className="bg-destructive text-(--destructive-foreground) hover:bg-destructive/90">
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </div>
                            </td>
                            </tr>
                        );
                        })
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
