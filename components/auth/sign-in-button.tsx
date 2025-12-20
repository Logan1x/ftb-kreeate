"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { IconBrandGithub } from "@tabler/icons-react"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="w-full sm:w-auto"
      size="lg"
    >
      <IconBrandGithub className="mr-2 h-5 w-5" />
      Sign in with GitHub
    </Button>
  )
}
