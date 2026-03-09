"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutList, Users, FolderPlus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ModalTable, type ColumnDef } from "@/components/shared";
import { ProjectsModalRow } from "./ProjectsModalRow";
import { ProfileManagementModal } from "./ProfileManagementModal";
import { ClientManagementModal } from "./ClientManagementModal";
import { CreateProjectModal } from "./CreateProjectModal";

import { ProjectManagementService } from "@/api";
import { useAccessToken } from "@/hooks/useAccessToken";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { Project, ProjectStatus } from "@/types/project";

/* ─── Table columns ───────────────────────────────────────── */
const COLUMNS: ColumnDef[] = [
  { key: "number",      label: "#"            },
  { key: "project",     label: "Project"      },
  { key: "client",      label: "Client"       },
  { key: "orderId",     label: "Order ID"     },
  { key: "profile",     label: "Profile"      },
  { key: "projectFile", label: "Project File" },
  { key: "status",      label: "Status"       },
];

/* ─── Status filter tabs ──────────────────────────────────── */
const FILTER_TABS = [
  { label: "All",       value: "all"       as const },
  { label: "WIP",       value: "WIP"       as const },
  { label: "NRA",       value: "NRA"       as const },
  { label: "Delivered", value: "DELIVERED" as const },
  { label: "Revision",  value: "REVISION"  as const },
  { label: "Cancelled", value: "CANCELLED" as const },
  { label: "Not Set",   value: "NULL"      as const },
];

type FilterValue = ProjectStatus | "all";

/* ─── Component ───────────────────────────────────────────── */
export function ProjectsModalTable() {
  const token = useAccessToken();
  const { department } = useUserInfo();

  // Only SALES department can manage profiles & clients
  const isSalesDept = department?.toUpperCase() === "SALES";

  /* ── Modal state ────────────────────────────────────────── */
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  /* ── Data state ─────────────────────────────────────────── */
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ── Server-driven filters (these drive the API call) ────── */
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // debounce search so we don't hit API on every keystroke
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset page on new search
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  /* ── Fetch projects ─────────────────────────────────────── */
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await ProjectManagementService.projectControllerFindAll({
        authorization: token,
        pageNo: currentPage,
        pageSize: rowsPerPage,
        ...(debouncedSearch && { searchKey: debouncedSearch }),
        ...(activeFilter !== "all" && {
          status: activeFilter as Exclude<FilterValue, "all">,
        }),
      });

      const data = (res as any)?.data;
      // API returns { data: { projects: [], total, totalPages } }
      const list: Project[] = Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data)
        ? data
        : [];
      const total: number = data?.total ?? list.length;

      setProjects(list);
      setTotalRecords(total);
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to load projects. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, rowsPerPage, debouncedSearch, activeFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ── Filter / pagination handlers ────────────────────────── */
  const handleFilterChange = (value: FilterValue) => {
    setActiveFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  /* ── ModalTable passthrough (no client-side filter) ──────── */
  // We pass pre-filtered server data; onFilterData is identity so ModalTable
  // doesn't re-filter it locally.
  const noopFilter = (data: Project[]) => data;

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* ── Action buttons ──────────────────────────────────── */}
      <div className="flex justify-end gap-2">
        {isSalesDept && (
          <>
            {/* New Project */}
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-[#6941C6] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a35b0] hover:shadow-md active:scale-[0.98]"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </button>

            {/* Client */}
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-[#1a6b3c] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#155c32] hover:shadow-md active:scale-[0.98]"
            >
              <Users className="h-4 w-4" />
              Client
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-navy-dark hover:shadow-md active:scale-[0.98]"
            >
              <LayoutList className="h-4 w-4" />
              Profile
            </button>
          </>
        )}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleFilterChange(tab.value)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              activeFilter === tab.value
                ? "bg-brand-navy text-white"
                : "bg-gray-100 text-foreground/70 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => fetchProjects()}
          disabled={loading}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-sm border border-border/40 bg-white text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          aria-label="Refresh"
          title="Refresh projects"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {loading && projects.length === 0 ? (
        /* Initial skeleton / empty loading screen */
        <div className="flex items-center justify-center rounded-sm border border-border/40 py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading projects…
          </span>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-border/40 py-16 text-center">
          <p className="text-sm font-medium text-foreground/70">
            No projects found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeFilter !== "all" || debouncedSearch
              ? "Try adjusting your filters or search term."
              : "Create your first project using the button above."}
          </p>
        </div>
      ) : (
        <ModalTable<Project, FilterValue>
          data={projects}
          columns={COLUMNS}
          totalRecords={totalRecords}
          enableSearch={true}
          searchPlaceholder="Search by name or order ID…"
          onFilterData={noopFilter as any}
          onSearchChange={(val) => {
            setSearch(val);
          }}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          renderRow={(project, index) => (
            <ProjectsModalRow
              key={project._id}
              project={project}
              rowNumber={(currentPage - 1) * rowsPerPage + index + 1}
            />
          )}
          enableCheckboxes={true}
          rowsPerPageOptions={[10, 20, 50, 100]}
          defaultRowsPerPage={rowsPerPage}
        />
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      <CreateProjectModal
        open={isCreateProjectModalOpen}
        onOpenChange={setIsCreateProjectModalOpen}
        onCreated={fetchProjects}
      />

      <ProfileManagementModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />

      <ClientManagementModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
      />
    </div>
  );
}
