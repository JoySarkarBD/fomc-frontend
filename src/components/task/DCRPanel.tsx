import { Button } from "@/components/ui/button";
import { DCRUploadArea } from "./DCRUploadArea";

export function DCRPanel() {
  return (
    <div className="rounded-sm bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      {/* Heading */}
      <h2 className="text-lg font-bold text-brand-navy/90 sm:text-xl">
        Daily Completion Report (DCR)
      </h2>

      {/* Description */}
      <p className="mt-2 text-sm leading-relaxed sm:mt-3">
        Review your assigned tasks for the day and mark as completed before
        submitting your DCR at the end of your shift
      </p>

      <div className="my-4 h-px bg-border/40 sm:my-6" />

      {/* Upload area */}
      <DCRUploadArea />

      {/* Submit button */}
      <div className="mt-6 sm:mt-8">
        <Button className="w-full rounded-sm bg-brand-navy py-5 text-sm font-semibold shadow-md transition-all hover:bg-brand-navy-dark hover:shadow-lg active:scale-[0.98] sm:py-6 sm:text-base">
          Submit DCR
        </Button>
        <p className="mt-2 text-center text-xs font-medium text-muted-foreground/60 sm:mt-3">
          Submit your DCR here
        </p>
      </div>
    </div>
  );
}
