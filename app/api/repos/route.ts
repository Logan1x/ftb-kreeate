import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { GitHubRepo } from "@/types/github"

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch user's repositories from GitHub
    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "User-Agent": "Kreeate-Issue-Generator",
          Accept: "application/vnd.github.v3+json",
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "GitHub token expired or invalid" },
          { status: 401 }
        )
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos: GitHubRepo[] = await response.json()

    // Filter repos where user has push access (can create issues)
    const accessibleRepos = repos.filter(
      (repo) => repo.permissions?.push || repo.permissions?.admin
    )

    // Return simplified repo data
    const simplifiedRepos = accessibleRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      html_url: repo.html_url,
    }))

    return NextResponse.json({
      repos: simplifiedRepos,
      username: session.user?.name,
    })
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    )
  }
}
