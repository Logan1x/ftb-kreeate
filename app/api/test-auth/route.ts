import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
    githubId: process.env.GITHUB_ID ? "SET" : "NOT SET",
    githubSecret: process.env.GITHUB_SECRET ? "SET" : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
  })
}
