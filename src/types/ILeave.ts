export type ILeaveStatus = "Approved" | "Rejected" | "Pending";

export interface ILeaveRecord {
  _id: string;
  user: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean | null;
  isRejected: boolean | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated — kept for backward compat; prefer ILeaveRecord */
export interface ILeave {
  id: string;
  rowNumber: number;
  leaveType: string;
  from: string;
  to: string;
  duration: string;
  status: ILeaveStatus;
}


