"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { ProjectManagementService } from "@/api";
import { useAccessToken } from "@/hooks/useAccessToken";
import type { Project } from "@/types/project";

interface ViewProjectModalProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProjectModal({
  projectId,
  open,
  onOpenChange,
}: ViewProjectModalProps) {
  const token = useAccessToken();
  const [loading, setLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);

  useEffect(() => {
    if (open && projectId && token) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await ProjectManagementService.projectControllerFindOne({
            id: projectId,
            authorization: token,
          });
          const data = (res as any)?.data;
          setProjectDetails(data);
        } catch (err: any) {
          const msg = err?.body?.message ?? "Failed to load project details.";
          toast.error(msg);
          onOpenChange(false);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setProjectDetails(null);
    }
  }, [open, projectId, token, onOpenChange]);

  const resolveName = (field: any) => {
    if (!field) return "—";
    if (typeof field === "string") return field;
    return field.name || "—";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-xl overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-brand-navy">
            Project Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of the selected project.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !projectDetails ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No details available.
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {projectDetails.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Order ID: <span className="font-medium text-foreground">{projectDetails.orderId || "—"}</span>
                </p>
              </div>
              <span className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                {projectDetails.status}
              </span>
            </div>

            {/* Grid specs */}
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <span className="block text-muted-foreground">Client</span>
                <span className="font-medium">{resolveName(projectDetails.client)}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Profile</span>
                <span className="font-medium">{resolveName(projectDetails.profile)}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Department</span>
                <span className="font-medium">{resolveName(projectDetails.assignedDepartment)}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Team</span>
                <span className="font-medium">{projectDetails.projectTeam || "—"}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Created At</span>
                <span className="font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(projectDetails.createdAt)}
                </span>
              </div>
              <div>
                <span className="block text-muted-foreground">Due Date</span>
                <span className="font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(projectDetails.dueDate)}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div className="rounded-md border bg-muted/30 p-3">
              <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
                Remarks
              </span>
              <p className="text-sm">
                {projectDetails.projectRemarks || "No remarks provided."}
              </p>
            </div>

            {/* Files */}
            <div>
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Project Files
              </span>
              {projectDetails.projectFiles && projectDetails.projectFiles.length > 0 ? (
                <ul className="space-y-2">
                  {projectDetails.projectFiles.map((fileUrl, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-brand-navy" />
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-blue-600 hover:underline"
                      >
                        {fileUrl}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
