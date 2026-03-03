import { Button } from "@/components/ui/button";

interface LeavePageHeaderProps {
  onAddLeaveRequest: () => void;
  onPendingRequests?: () => void;
  showPendingButton?: boolean;
}

export function LeavePageHeader({
  onAddLeaveRequest,
  onPendingRequests,
  showPendingButton,
}: LeavePageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-base leading-relaxed text-muted-foreground/80 sm:text-xl md:text-2xl">
        View your leave balances and request new leaves. Review the details of
        your upcoming and past leaves
      </p>

      <div className="flex shrink-0 items-center gap-2">
        {showPendingButton && (
          <Button
            onClick={onPendingRequests}
            variant="outline"
            className="h-9 gap-1.5 rounded-sm border-amber-300 bg-amber-50 px-6 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 hover:text-amber-800 hover:shadow-md active:scale-95 sm:h-10 sm:px-8 sm:text-base"
          >
            Pending Requests
          </Button>
        )}

        <Button
          onClick={onAddLeaveRequest}
          className="h-9 w-40 gap-1.5 rounded-sm bg-[#14804A] px-6 text-sm font-medium transition-all hover:bg-[#14804A] hover:shadow-md active:scale-95 sm:h-10 sm:w-auto sm:px-10 sm:text-base"
        >
          Request Leave
        </Button>
      </div>
    </div>
  );
}
