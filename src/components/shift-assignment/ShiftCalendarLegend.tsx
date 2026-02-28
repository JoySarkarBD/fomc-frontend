import Image from "next/image";
import { SHIFT_STYLES } from "@/constants/shift";
import type { ShiftType } from "@/types/shift";

const LEGEND_ITEMS: ShiftType[] = ["morning", "evening", "night", "off"];

export function ShiftCalendarLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-6 px-2 sm:mt-8 sm:gap-8 sm:px-3">
      {LEGEND_ITEMS.map((type) => {
        const style = SHIFT_STYLES[type];
        return (
          <div key={type} className="flex items-center gap-1.5 sm:gap-2">
            <Image
              src={style.icon}
              alt={style.label}
              width={16}
              height={16}
              className="sm:w-4.5 sm:h-4.5"
            />
            <span className="text-xs font-medium text-foreground/70 sm:text-sm">
              <span className="sm:hidden">{style.label.split(" ")[0]}</span>
              <span className="hidden sm:inline">{style.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}