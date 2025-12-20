import type { Session } from "next-auth"
import { SignOutButton } from "./sign-out-button"

interface UserProfileProps {
  session: Session
}

export function UserProfile({ session }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{session.user?.name}</span>
          {session.user?.email && (
            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          )}
        </div>
      </div>
      <SignOutButton />
    </div>
  )
}
