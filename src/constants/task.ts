import {
  ClipboardList,
  ListChecks,
  FileText,
} from "lucide-react";

import type { TaskPipelineStepData } from "@/types/task";

// ---------------------------------------------------------------------------
// Pipeline steps (flow: All Tasks → To Do → Submit DCR)
// ---------------------------------------------------------------------------

export const TASK_PIPELINE_STEPS: TaskPipelineStepData[] = [
  {
    id: "all-tasks",
    label: "All Tasks",
    count: 0,
    icon: ClipboardList,
    bgColor: "bg-[#e7f1fd]",
    arrowColor: "text-[#6B7280]",
  },
  {
    id: "todo",
    label: "To Do",
    count: 0,
    icon: ListChecks,
    bgColor: "bg-[#e7f1fd]",
    arrowColor: "text-[#6B7280]",
  },
  {
    id: "submit-dcr",
    label: "Submit DCR",
    count: 0,
    icon: FileText,
    bgColor: "bg-[#e7f1fd]",
  },
];
