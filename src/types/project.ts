/** Possible statuses for a project — matches API enum */
export type ProjectStatus =
  | "NULL"
  | "NRA"
  | "WIP"
  | "DELIVERED"
  | "CANCELLED"
  | "REVISION";

/** A single project item returned from GET /api/project */
export interface Project {
  _id: string;
  name: string;
  orderId: string;
  status: ProjectStatus;
  projectRemarks?: string;
  projectFiles?: string[];
  dueDate?: string;
  projectTeam?: string;
  client?: { _id: string; name: string } | string | null;
  profile?: { _id: string; name: string } | string | null;
  assignedDepartment?: { _id: string; name: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Filter tab for the project list */
export interface ProjectFilterTab {
  label: string;
  value: ProjectStatus | "all";
}
