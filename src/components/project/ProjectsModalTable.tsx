"use client";

import { useState } from "react";
import { LayoutList, Users } from "lucide-react";
import { ModalTable, type ColumnDef } from "@/components/shared";
import { ProjectsModalRow } from "./ProjectsModalRow";
import { ProfileManagementModal } from "./ProfileManagementModal";
import { ClientManagementModal } from "./ClientManagementModal";
import { DEMO_PROJECTS, PROJECT_FILTER_TABS } from "@/constants/project";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { Project, ProjectStatus } from "@/types/project";

const TOTAL_RECORDS = 97;

const COLUMNS: ColumnDef[] = [
  { key: "number", label: "#" },
  { key: "project", label: "Project" },
  { key: "client", label: "Client" },
  { key: "orderId", label: "Order ID" },
  { key: "profile", label: "Profile" },
  { key: "projectFile", label: "Project File" },
  { key: "status", label: "Status" },
];

export function ProjectsModalTable() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const { department } = useUserInfo();

  // Only SALES department can manage profiles & clients
  const isSalesDept = department?.toUpperCase() === "SALES";

  const handleFilterData = (
    data: Project[],
    filter: ProjectStatus | "all",
    search: string
  ): Project[] => {
    return data.filter((project) => {
      const matchesFilter = filter === "all" || project.status === filter;
      const matchesSearch = project.projectName
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top-right action buttons — SALES only */}
      {isSalesDept && (
        <div className="flex justify-end gap-2">
          {/* Client button */}
          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm bg-[#1a6b3c] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#155c32] hover:shadow-md active:scale-[0.98]"
          >
            <Users className="h-4 w-4" />
            Client
          </button>

          {/* Profile button */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-navy-dark hover:shadow-md active:scale-[0.98]"
          >
            <LayoutList className="h-4 w-4" />
            Profile
          </button>
        </div>
      )}

      {/* Projects table */}
      <ModalTable<Project, ProjectStatus | "all">
        data={DEMO_PROJECTS}
        columns={COLUMNS}
        totalRecords={TOTAL_RECORDS}
        filterTabs={PROJECT_FILTER_TABS}
        defaultFilter="all"
        onFilterData={handleFilterData}
        enableSearch={true}
        searchPlaceholder="Search..."
        renderRow={(project, index) => (
          <ProjectsModalRow
            key={project.id}
            project={project}
            rowNumber={index + 1}
          />
        )}
        enableCheckboxes={true}
        rowsPerPageOptions={[10, 20, 50, 100]}
        defaultRowsPerPage={10}
      />

      {/* Profile Management Modal */}
      <ProfileManagementModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />

      {/* Client Management Modal */}
      <ClientManagementModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
      />
    </div>
  );
}
