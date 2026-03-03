export const LEAVE_DESCRIPTION =
  "View your leave balances and request new leaves. Review the details of your upcoming and past leaves";

export const LEAVE_TABLE_COLUMNS = [
  "#",
  "LEAVE TYPE",
  "FROM",
  "TO",
  "DURATION",
  "STATUS",
] as const;

export const LEAVE_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  SICK_LEAVE: "Sick Leave",
  CASUAL_LEAVE: "Casual Leave",
  GOVERNMENT_FESTIVAL_HOLIDAY: "Government Festival Holiday",
};
