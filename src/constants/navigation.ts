// Custom SVG icon components for sidebar
import DashboardIcon from "@/components/icons/DashboardIcon";
import TasksIcon from "@/components/icons/TasksIcon";
import TeamMemberIcon from "@/components/icons/TeamMemberIcon";
import AttendanceIcon from "@/components/icons/AttendanceIcon";
import LeaveManagementIcon from "@/components/icons/LeaveManagementIcon";
import ShiftAssignmentIcon from "@/components/icons/ShiftAssignmentIcon";
import LearningIcon from "@/components/icons/LearningIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import FeedbackIcon from "@/components/icons/FeedbackIcon";

import type { NavItem } from "@/types";
import ProjectIcon from "@/components/icons/ProjectIcon";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: DashboardIcon,
  },
  {
    label: "Task",
    href: "/task",
    icon: TasksIcon,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: ProjectIcon,
  },
  // {
  //   label: "Team Members",
  //   href: "/team-members",
  //   icon: TeamMemberIcon,
  // },
  {
    label: "Attendance",
    href: "/attendance",
    icon: AttendanceIcon,
  },
  {
    label: "Leave Management",
    href: "/leave",
    icon: LeaveManagementIcon,
  },
  {
    label: "Shift Assignment",
    href: "/shift-assignment",
    icon: ShiftAssignmentIcon,
  },
  {
    label: "Learning & Training",
    href: "/learning-training",
    icon: LearningIcon,
  },
  {
    label: "Notification",
    href: "/notification",
    icon: NotificationIcon,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: FeedbackIcon,
  },
];
