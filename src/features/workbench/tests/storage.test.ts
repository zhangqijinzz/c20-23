import { describe, expect, it } from 'vitest'
import { LocalWorkspaceRepository } from '../workspaceRepository'
import type { StorageService } from '../storageService'
import { createInitialDocument } from '../../../shared/models'
import { markPlanFinalized } from '../../../shared/finalizeRules'

function memoryStorage(initial: string | null = null): StorageService {
  let value = initial
  return { read: async () => value, write: async (next) => { value = next } }
}

describe('local workspace repository', () => {
  it('round trips a document', async () => {
    const repository = new LocalWorkspaceRepository(memoryStorage())
    const document = createInitialDocument()
    await repository.save(document)
    await expect(repository.load()).resolves.toEqual(document)
  })

  it('falls back when stored JSON is damaged', async () => {
    const repository = new LocalWorkspaceRepository(memoryStorage('{broken'))
    await expect(repository.load()).resolves.toBeNull()
  })

  it('persists the finalized state together with the plan', async () => {
    const repository = new LocalWorkspaceRepository(memoryStorage())
    const document = createInitialDocument()
    const finalized = markPlanFinalized(document.plans[0], '2026-10-04T09:00:00.000Z')
    const next = { ...document, plans: [finalized] }
    await repository.save(next)
    const loaded = await repository.load()
    expect(loaded?.plans[0].finalizedAt).toBe('2026-10-04T09:00:00.000Z')
    expect(loaded?.plans[0].finalizeHistory).toHaveLength(1)
  })

  it('normalizes legacy plans that have no finalize fields', async () => {
    const document = createInitialDocument()
    const legacyPlan = { ...document.plans[0] } as Record<string, unknown>
    delete legacyPlan.finalizedAt
    delete legacyPlan.finalizeHistory
    const repository = new LocalWorkspaceRepository(memoryStorage(JSON.stringify({ ...document, plans: [legacyPlan] })))
    const loaded = await repository.load()
    expect(loaded?.plans[0].finalizedAt).toBeNull()
    expect(loaded?.plans[0].finalizeHistory).toEqual([])
  })
})
