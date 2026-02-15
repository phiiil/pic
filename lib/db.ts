import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'ai_results.db')

// Ensure data directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize database with WAL mode for better concurrency
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    engine TEXT NOT NULL,
    response TEXT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_project_id ON ai_results(project_id);
  CREATE INDEX IF NOT EXISTS idx_engine ON ai_results(engine);
  CREATE INDEX IF NOT EXISTS idx_created_at ON ai_results(created_at);
`)

export interface AIResult {
  id: number
  project_id: number
  prompt: string
  engine: string
  response: string
  metadata: string | null
  created_at: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectInput {
  name: string
  description?: string
}

export interface AIResultInput {
  project_id: number
  prompt: string
  engine: string
  response: string
  metadata?: Record<string, any>
}

// Project functions
export function createProject(input: ProjectInput): Project {
  const stmt = db.prepare(`
    INSERT INTO projects (name, description)
    VALUES (?, ?)
  `)

  const result = stmt.run(input.name, input.description || null)
  return getProjectById(result.lastInsertRowid as number)
}

export function getProjectById(id: number): Project {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?')
  return stmt.get(id) as Project
}

export function getAllProjects(): Project[] {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC')
  return stmt.all() as Project[]
}

// Get count of results for a project
export function getResultCountForProject(projectId: number): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM ai_results WHERE project_id = ?')
  const result = stmt.get(projectId) as { count: number }
  return result.count
}

export function updateProject(id: number, input: Partial<ProjectInput>): Project {
  const updates: string[] = []
  const params: any[] = []

  if (input.name !== undefined) {
    updates.push('name = ?')
    params.push(input.name)
  }

  if (input.description !== undefined) {
    updates.push('description = ?')
    params.push(input.description)
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const stmt = db.prepare(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = ?
    `)
    stmt.run(...params)
  }

  return getProjectById(id)
}

export function deleteProject(id: number): void {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?')
  stmt.run(id)
}

// Insert a new result
export function insertResult(input: AIResultInput): AIResult {
  const stmt = db.prepare(`
    INSERT INTO ai_results (project_id, prompt, engine, response, metadata)
    VALUES (?, ?, ?, ?, ?)
  `)

  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null

  const result = stmt.run(
    input.project_id,
    input.prompt,
    input.engine,
    input.response,
    metadataJson
  )

  return getResultById(result.lastInsertRowid as number)
}

// Get result by ID
export function getResultById(id: number): AIResult {
  const stmt = db.prepare('SELECT * FROM ai_results WHERE id = ?')
  return stmt.get(id) as AIResult
}

// Get all results (with optional filters)
export function getResults(options?: {
  project_id?: number
  engine?: string
  limit?: number
  offset?: number
}): AIResult[] {
  let query = 'SELECT * FROM ai_results'
  const conditions: string[] = []
  const params: any[] = []

  if (options?.project_id) {
    conditions.push('project_id = ?')
    params.push(options.project_id)
  }

  if (options?.engine) {
    conditions.push('engine = ?')
    params.push(options.engine)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'

  if (options?.limit) {
    query += ' LIMIT ?'
    params.push(options.limit)
  }

  if (options?.offset) {
    query += ' OFFSET ?'
    params.push(options.offset)
  }

  const stmt = db.prepare(query)
  return stmt.all(...params) as AIResult[]
}

// Get results by prompt (grouped by prompt)
export function getResultsByPrompt(prompt: string): AIResult[] {
  const stmt = db.prepare(`
    SELECT * FROM ai_results 
    WHERE prompt = ? 
    ORDER BY created_at DESC
  `)
  return stmt.all(prompt) as AIResult[]
}

export default db

