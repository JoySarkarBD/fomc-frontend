"use client";

import { LeaveTable } from "./LeaveTable";
import { LeavePageHeader } from "./LeavePageHeader";
import { useState } from "react";
import { AddLeaveRequestModal } from "./AddLeaveRequestModal";
import { PendingLeaveRequestsModal } from "./PendingLeaveRequestsModal";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useAccessToken } from "@/hooks/useAccessToken";
import type { ShiftUserOption } from "@/components/shift-assignment/ShiftUserSelector";

const PRIVILEGED_ROLES = ["SUPER ADMIN", "PROJECT MANAGER"];

export function LeaveContent() {
  const [isAddLeaveRequestOpen, setIsAddLeaveRequestOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState<ShiftUserOption | null>(null);

  const userInfo = useUserInfo();
  const token = useAccessToken();
  const isPrivileged = PRIVILEGED_ROLES.includes(userInfo?.role ?? "");

  const handleLeaveSubmitted = () => {
    setIsAddLeaveRequestOpen(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header: description + Pending Requests + Request Leave buttons */}
      <LeavePageHeader
        onAddLeaveRequest={() => setIsAddLeaveRequestOpen(true)}
        showPendingButton={isPrivileged}
        onPendingRequests={() => setIsPendingOpen(true)}
      />

      {/* Request Leave Modal */}
      <AddLeaveRequestModal
        open={isAddLeaveRequestOpen}
        onOpenChange={setIsAddLeaveRequestOpen}
        onSubmitted={handleLeaveSubmitted}
      />

      {/* Pending Leave Requests Modal (privileged only) */}
      {isPrivileged && (
        <PendingLeaveRequestsModal
          open={isPendingOpen}
          onOpenChange={setIsPendingOpen}
        />
      )}

      {/* Table */}
      <LeaveTable
        refreshKey={refreshKey}
        isPrivileged={isPrivileged}
        authorization={token}
        myUserId={userInfo?.userId ?? null}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />
    </div>
  );
}
