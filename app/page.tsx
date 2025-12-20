"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { IconLoader2 } from "@tabler/icons-react"
import { SignInButton } from "@/components/auth/sign-in-button"
import { UserProfile } from "@/components/auth/user-profile"
import { RepoSelector } from "@/components/repo-selector"

const PRIORITY_LABELS = [
  { value: "P0-Unbreak Now", label: "P0-Unbreak Now" },
  { value: "P1-Must Have", label: "P1-Must Have" },
  { value: "P2-Normal", label: "P2-Normal" },
  { value: "P3-Low Priority", label: "P3-Low Priority" },
] as const

export default function Home() {
  const { data: session, status } = useSession()
  const [input, setInput] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [selectedLabel, setSelectedLabel] = useState("P2-Normal")
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; name: string } | null>(null)
  const [lastRepo, setLastRepo] = useState<{ owner: string; name: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | React.ReactNode>("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [openAccordion, setOpenAccordion] = useState<string[]>(["describe"])

  // Fetch user preferences when authenticated
  useEffect(() => {
    if (session) {
      fetchUserPreferences()
    }
  }, [session])

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch("/api/preferences")
      if (response.ok) {
        const data = await response.json()
        if (data.lastRepo) {
          setLastRepo(data.lastRepo)
        }
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
    }
  }

  const generateIssue = async () => {
    if (!input.trim()) return

    setIsGenerating(true)
    setMessage("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate issue")
      }

      const data = await response.json()
      setTitle(data.title)
      setBody(data.body)
      setMessage("Issue generated successfully!")
      setMessageType("success")
      // Collapse describe section and open review section
      setOpenAccordion(["review"])
    } catch (error) {
      console.error(error)
      setMessage("Failed to generate issue. Please try again.")
      setMessageType("error")
    } finally {
      setIsGenerating(false)
    }
  }

  const submitIssue = async () => {
    if (!title.trim() || !body.trim() || !selectedRepo) return

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          label: selectedLabel,
          repoOwner: selectedRepo.owner,
          repoName: selectedRepo.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to submit issue" }))
        throw new Error(errorData.error || "Failed to submit issue")
      }

      const data = await response.json()
      setMessage(
        <span>
          Issue created successfully! View it at{" "}
          <a
            href={data.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline font-medium"
          >
            {data.issueUrl}
          </a>
        </span>
      )
      setMessageType("success")
      // Reset form
      setInput("")
      setTitle("")
      setBody("")
      setSelectedLabel("P2-Normal")
      setOpenAccordion(["describe"])
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : "Failed to submit issue. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!session) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" transform="rotate(15)" className="text-primary shrink-0">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 4a4 4 0 0 1 3.995 3.8l.005 .2a1 1 0 0 1 .428 .096l3.033 -1.938a1 1 0 1 1 1.078 1.684l-3.015 1.931a7.17 7.17 0 0 1 .476 2.227h3a1 1 0 0 1 0 2h-3v1a6.01 6.01 0 0 1 -.195 1.525l2.708 1.616a1 1 0 1 1 -1.026 1.718l-2.514 -1.501a6.002 6.002 0 0 1 -3.973 2.56v-5.918a1 1 0 0 0 -2 0v5.917a6.002 6.002 0 0 1 -3.973 -2.56l-2.514 1.503a1 1 0 1 1 -1.026 -1.718l2.708 -1.616a6.01 6.01 0 0 1 -.195 -1.526v-1h-3a1 1 0 0 1 0 -2h3.001v-.055a7 7 0 0 1 .474 -2.173l-3.014 -1.93a1 1 0 1 1 1.078 -1.684l3.032 1.939l.024 -.012l.068 -.027l.019 -.005l.016 -.006l.032 -.008l.04 -.013l.034 -.007l.034 -.004l.045 -.008l.015 -.001l.015 -.002l.087 -.004a4 4 0 0 1 4 -4zm0 2a2 2 0 0 0 -2 2h4a2 2 0 0 0 -2 -2z" />
          </svg>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kreeate</h1>
            <p className="text-muted-foreground text-sm">Bug Report / Feature Request</p>
          </div>
        </div>

        <div className="ring-foreground/10 bg-card text-card-foreground rounded-none ring-1 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Welcome to Kreeate</h2>
          <p className="text-muted-foreground mb-6">
            Sign in with GitHub to create AI-powered bug reports and feature requests for your repositories.
          </p>
          <SignInButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" transform="rotate(15)" className="text-primary shrink-0">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 4a4 4 0 0 1 3.995 3.8l.005 .2a1 1 0 0 1 .428 .096l3.033 -1.938a1 1 0 1 1 1.078 1.684l-3.015 1.931a7.17 7.17 0 0 1 .476 2.227h3a1 1 0 0 1 0 2h-3v1a6.01 6.01 0 0 1 -.195 1.525l2.708 1.616a1 1 0 1 1 -1.026 1.718l-2.514 -1.501a6.002 6.002 0 0 1 -3.973 2.56v-5.918a1 1 0 0 0 -2 0v5.917a6.002 6.002 0 0 1 -3.973 -2.56l-2.514 1.503a1 1 0 1 1 -1.026 -1.718l2.708 -1.616a6.01 6.01 0 0 1 -.195 -1.526v-1h-3a1 1 0 0 1 0 -2h3.001v-.055a7 7 0 0 1 .474 -2.173l-3.014 -1.93a1 1 0 1 1 1.078 -1.684l3.032 1.939l.024 -.012l.068 -.027l.019 -.005l.016 -.006l.032 -.008l.04 -.013l.034 -.007l.034 -.004l.045 -.008l.015 -.001l.015 -.002l.087 -.004a4 4 0 0 1 4 -4zm0 2a2 2 0 0 0 -2 2h4a2 2 0 0 0 -2 -2z" />
          </svg>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kreeate</h1>
            <p className="text-muted-foreground text-sm">Bug Report / Feature Request</p>
          </div>
        </div>
        <UserProfile session={session} />
      </div>

      <Accordion
        value={openAccordion}
        onValueChange={setOpenAccordion}
        className="ring-foreground/10 bg-card text-card-foreground rounded-none ring-1 mb-4 sm:mb-6"
      >
        <AccordionItem value="describe" className="px-4 sm:px-6">
          <AccordionTrigger className="text-base sm:text-lg font-medium py-4">
            Describe your issue
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground text-sm mb-4">
              Provide a detailed description of the bug or feature request.
            </p>
            <Textarea
              placeholder="Enter your bug report or feature request..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              className="mb-4 text-base"
            />
            <Button onClick={generateIssue} disabled={isGenerating || !input.trim()} className="w-full sm:w-auto mb-2">
              {isGenerating && <IconLoader2 className="mr-2 animate-spin" />}
              {isGenerating ? "Generating..." : "Generate Issue"}
            </Button>
          </AccordionContent>
        </AccordionItem>

        {(title || body) && (
          <AccordionItem value="review" className="px-4 sm:px-6">
            <AccordionTrigger className="text-base sm:text-lg font-medium py-4">
              Review and Edit
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground text-sm mb-4">
                Review the generated title and description, then edit as needed.
              </p>
              <Input
                placeholder="Issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 text-base"
              />
              <Textarea
                placeholder="Issue description"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="mb-4 text-base"
              />
              <div className="mb-4">
                <RepoSelector
                  value={selectedRepo}
                  onChange={setSelectedRepo}
                  lastRepo={lastRepo}
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={selectedLabel} onValueChange={(value) => value && setSelectedLabel(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LABELS.map((label) => (
                      <SelectItem key={label.value} value={label.value}>
                        {label.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={submitIssue}
                disabled={isSubmitting || !title.trim() || !body.trim() || !selectedRepo}
                className="w-full sm:w-auto mb-2"
              >
                {isSubmitting && <IconLoader2 className="mr-2 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </Button>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {message && (
        <Alert variant={messageType === "error" ? "destructive" : "default"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
