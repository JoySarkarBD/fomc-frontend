import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import type { UserProfile } from "@/types";
import { useUserInfo } from "@/hooks/useUserInfo";

export function NavbarUserProfile() {
  const { name, email } = useUserInfo();
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <button
      type="button"
      className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-muted"
    >
      <Avatar className="h-9 w-9">
        {/* {name && <AvatarImage src={name} alt={user.name} />} */}
        <AvatarFallback className="bg-brand-navy text-xs font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="hidden text-left md:block">
        <p className="text-sm font-medium leading-tight text-foreground">
          {name}
        </p>
        <p className="text-xs leading-tight text-muted-foreground">{email}</p>
      </div>

      <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
    </button>
  );
}
