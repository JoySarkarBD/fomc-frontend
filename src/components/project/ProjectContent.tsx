"use client";

import { ProjectsModalTable } from "./ProjectsModalTable";
import { PROJECT_DESCRIPTION } from "@/constants/project";

export default function ProjectContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground/80 sm:text-lg sm:pr-8 md:text-2xl">
        {PROJECT_DESCRIPTION}
      </p>

      {/* Table */}
      <ProjectsModalTable />
    </div>
  );
}