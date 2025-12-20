import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userPreferences } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    })

    if (!prefs || !prefs.lastRepoOwner || !prefs.lastRepoName) {
      return NextResponse.json({ lastRepo: null })
    }

    return NextResponse.json({
      lastRepo: {
        owner: prefs.lastRepoOwner,
        name: prefs.lastRepoName,
      },
    })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}
