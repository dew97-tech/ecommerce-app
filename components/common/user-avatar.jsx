import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

function getInitials(name) {
  if (!name) return null

  const initials = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || null
}

export function UserAvatar({
  name,
  image,
  className,
  fallbackClassName,
  iconClassName,
}) {
  const initials = getInitials(name)

  return (
    <Avatar className={className}>
      {image ? <AvatarImage src={image} alt={name || "User"} /> : null}
      <AvatarFallback className={cn("bg-muted", fallbackClassName)}>
        {initials ? (
          <span className="text-xs font-semibold tracking-wide">
            {initials}
          </span>
        ) : (
          <User className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
        )}
      </AvatarFallback>
    </Avatar>
  )
}
