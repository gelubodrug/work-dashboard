import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getInitials } from "@/utils/get-initials"
import { getAvatarColors } from "@/utils/get-avatar-colors"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  showName?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ name, showName = true, size = "sm", className }: UserAvatarProps) {
  if (!name) return null

  const { background, text } = getAvatarColors(name)

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(sizeClasses[size], "border-2 border-white")}>
              <AvatarFallback style={{ backgroundColor: background, color: text }} className="text-foreground">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showName && <span className="ml-2 font-medium text-sm hidden md:block">{name}</span>}
    </div>
  )
}
