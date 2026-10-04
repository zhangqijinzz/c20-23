import { createInitialDocument, type WorkspaceDocument, type WorkspacePlan } from '../../shared/models'
import { BrowserStorageService, isWorkspaceDocument, type StorageService } from './storageService'

export interface WorkspaceRepository {
  load(): Promise<WorkspaceDocument | null>
  save(document: WorkspaceDocument): Promise<void>
}

export class LocalWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly storage: StorageService = new BrowserStorageService()) {}

  async load(): Promise<WorkspaceDocument | null> {
    try {
      const raw = await this.storage.read()
      if (!raw) return null
      const parsed: unknown = JSON.parse(raw)
      return isWorkspaceDocument(parsed) ? normalizeDocument(parsed) : null
    } catch {
      return null
    }
  }

  async save(document: WorkspaceDocument): Promise<void> {
    await this.storage.write(JSON.stringify(document))
  }
}

export function normalizePlan(plan: WorkspacePlan): WorkspacePlan {
  if (plan.finalized === true) {
    return {
      ...plan,
      finalized: true,
      finalizedAt: typeof plan.finalizedAt === 'string' ? plan.finalizedAt : plan.updatedAt,
      finalizeHistory: Array.isArray(plan.finalizeHistory) ? plan.finalizeHistory : [{ action: 'finalize', at: typeof plan.finalizedAt === 'string' ? plan.finalizedAt : plan.updatedAt }],
    }
  }
  return { ...plan, finalized: false, finalizedAt: null, finalizeHistory: Array.isArray(plan.finalizeHistory) ? plan.finalizeHistory : [] }
}

export function normalizeDocument(document: WorkspaceDocument): WorkspaceDocument {
  return { ...document, plans: document.plans.map(normalizePlan) }
}

export function getInitialDocument(document: WorkspaceDocument | null): WorkspaceDocument {
  return document ?? createInitialDocument()
}
