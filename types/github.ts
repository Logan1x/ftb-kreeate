export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  private: boolean
  description: string | null
  html_url: string
  permissions?: {
    admin: boolean
    push: boolean
    pull: boolean
  }
  updated_at: string
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
}
