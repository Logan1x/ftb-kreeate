"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { IconLoader2, IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Repo {
  id: number
  name: string
  full_name: string
  owner: string
  private: boolean
  description: string | null
}

interface RepoSelectorProps {
  value: { owner: string; name: string } | null
  onChange: (repo: { owner: string; name: string } | null) => void
  lastRepo?: { owner: string; name: string } | null
}

export function RepoSelector({ value, onChange, lastRepo }: RepoSelectorProps) {
  const [mode, setMode] = useState<"dropdown" | "manual">("dropdown")
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualOwner, setManualOwner] = useState("")
  const [manualRepo, setManualRepo] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null)
  const [openOwner, setOpenOwner] = useState(false)
  const [openRepo, setOpenRepo] = useState(false)

  // Fetch repos on mount
  useEffect(() => {
    fetchRepos()
  }, [])

  // Compute unique owners from repos
  const uniqueOwners = Array.from(new Set(repos.map(r => r.owner))).sort()

  // Filter repos by selected owner
  const filteredRepos = selectedOwner 
    ? repos.filter(r => r.owner === selectedOwner)
    : []

  // Set default value from lastRepo
  useEffect(() => {
    if (lastRepo && !value) {
      onChange(lastRepo)
      setManualOwner(lastRepo.owner)
      setManualRepo(lastRepo.name)
      setSelectedOwner(lastRepo.owner)
    }
  }, [lastRepo])

  const fetchRepos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/repos")
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to fetch repositories")
        }
        throw new Error("Failed to fetch repositories")
      }

      const data: Repo[] = await response.json()
      setRepos(data)

      // Auto-select last repo if available
      if (lastRepo && data.length > 0) {
        const matchedRepo = data.find(
          (r) => r.owner === lastRepo.owner && r.name === lastRepo.name
        )
        if (matchedRepo) {
          onChange({ owner: matchedRepo.owner, name: matchedRepo.name })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories")
      setMode("manual") // Fallback to manual mode on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualInputChange = (owner: string, repo: string) => {
    setManualOwner(owner)
    setManualRepo(repo)
    
    // Validate both fields are filled
    if (owner && repo) {
      onChange({ owner, name: repo })
    } else {
      onChange(null)
    }
  }

  const handleOwnerSelect = (owner: string) => {
    setSelectedOwner(owner)
    setOpenOwner(false)
    // Reset repo selection when owner changes
    onChange(null)
  }

  const handleRepoSelect = (repoName: string) => {
    if (selectedOwner) {
      onChange({ owner: selectedOwner, name: repoName })
      setOpenRepo(false)
    }
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Repository</label>
        <div className="flex items-center gap-2">
          {mode === "dropdown" && repos.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchRepos}
              disabled={isLoading}
            >
              <IconRefresh className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === "dropdown" ? "manual" : "dropdown")}
          >
            {mode === "dropdown" ? "Manual Input" : "Dropdown"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === "dropdown" ? (
        isLoading ? (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading repositories...
          </div>
        ) : repos.length > 0 ? (
          <div className="flex gap-2">
            {/* Owner/Username Selector */}
            <Popover open={openOwner} onOpenChange={setOpenOwner}>
              <PopoverTrigger className="flex-1">
                <div
                  role="combobox"
                  aria-expanded={openOwner}
                  className="flex h-8 w-full items-center justify-between rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors hover:bg-input/30 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 cursor-pointer"
                >
                  <span className="truncate flex-1 text-left">
                    {selectedOwner || "Select owner..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[500px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search owners..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No owner found.</CommandEmpty>
                    <CommandGroup>
                      {uniqueOwners.map((owner) => (
                        <CommandItem
                          key={owner}
                          value={owner}
                          onSelect={() => handleOwnerSelect(owner)}
                          className="cursor-pointer"
                        >
                          <span className="truncate">{owner}</span>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              selectedOwner === owner ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Repository Selector */}
            <Popover open={openRepo} onOpenChange={setOpenRepo}>
              <PopoverTrigger className="flex-1">
                <div
                  role="combobox"
                  aria-expanded={openRepo}
                  className="flex h-8 w-full items-center justify-between rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors hover:bg-input/30 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  {...(!selectedOwner && { 'data-disabled': true })}
                >
                  <span className="truncate flex-1 text-left">
                    {value?.name || "Select repository..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
              </PopoverTrigger>
              {selectedOwner && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search repositories..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No repository found.</CommandEmpty>
                      <CommandGroup>
                        {filteredRepos.map((repo) => (
                          <CommandItem
                            key={repo.id}
                            value={repo.name}
                            onSelect={() => handleRepoSelect(repo.name)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-1 items-center gap-2 min-w-0">
                              <span className="truncate">{repo.name}</span>
                              {repo.private && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                                  Private
                                </Badge>
                              )}
                            </div>
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4 shrink-0",
                                value?.name === repo.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No repositories found. Try manual input.
          </div>
        )
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="owner or organization"
            value={manualOwner}
            onChange={(e) => handleManualInputChange(e.target.value, manualRepo)}
            className="font-mono text-sm flex-1"
          />
          <Input
            placeholder="repository-name"
            value={manualRepo}
            onChange={(e) => handleManualInputChange(manualOwner, e.target.value)}
            className="font-mono text-sm flex-1"
          />
        </div>
      )}

      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-mono">{value.owner}/{value.name}</span>
        </p>
      )}
    </div>
  )
}
