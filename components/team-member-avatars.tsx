import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getInitials } from "@/utils/get-initials"
import { getAvatarColors } from "@/utils/get-avatar-colors"

interface TeamMemberAvatarsProps {
  members: string[]
  maxVisible?: number
  showNames?: boolean
  label?: string
}

export function TeamMemberAvatars({ members, maxVisible = 5, showNames = false, label }: TeamMemberAvatarsProps) {
  if (!members || members.length === 0) return null

  const visibleMembers = members.slice(0, maxVisible)
  const extraCount = Math.max(0, members.length - maxVisible)

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        <TooltipProvider>
          {visibleMembers.map((member, index) => {
            const { background, text } = getAvatarColors(member)
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback style={{ backgroundColor: background, color: text }} className="text-xs">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{member}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {extraCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback style={{ backgroundColor: "#f3f4f6", color: "#374151" }} className="text-xs">
                    +{extraCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-xs">
                  {members.slice(maxVisible).map((member, i) => (
                    <p key={i}>{member}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {showNames && (
        <div className="ml-2 text-[0.72rem] sm:text-sm md:text-base text-muted-foreground line-clamp-1 max-w-[150px] md:max-w-full">
          {label && <span className="font-medium mr-1">{label}:</span>}
          {members.join(", ")}
        </div>
      )}
    </div>
  )
}
