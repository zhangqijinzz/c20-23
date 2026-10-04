import { describe, expect, it } from 'vitest'
import { LocalWorkspaceRepository } from '../workspaceRepository'
import type { StorageService } from '../storageService'
import { createInitialDocument, createPlan, type WorkspaceDocument } from '../../../shared/models'

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

  it('fills finalization fields when loading plans saved before the feature', async () => {
    const oldPlan = createPlan('历史方案', false)
    const legacyDocument = {
      version: 1 as const,
      plans: [{ ...oldPlan, finalized: undefined, finalizedAt: undefined, finalizeHistory: undefined }],
      activePlanId: oldPlan.id,
    }
    const repository = new LocalWorkspaceRepository(memoryStorage(JSON.stringify(legacyDocument)))
    const loaded = await repository.load()

    expect(loaded).not.toBeNull()
    expect(loaded?.plans[0]).toMatchObject({ finalized: false, finalizedAt: null, finalizeHistory: [] })
  })

  it('round trips a finalized plan with its finalize history', async () => {
    const repository = new LocalWorkspaceRepository(memoryStorage())
    const plan = createPlan('定稿方案', true)
    const document: WorkspaceDocument = {
      version: 1,
      plans: [{
        ...plan,
        finalized: true,
        finalizedAt: '2026-10-04T09:00:00.000Z',
        finalizeHistory: [{ action: 'finalize' as const, at: '2026-10-04T09:00:00.000Z' }],
      }],
      activePlanId: plan.id,
    }
    await repository.save(document)
    const loaded = await repository.load()

    expect(loaded?.plans[0].finalized).toBe(true)
    expect(loaded?.plans[0].finalizedAt).toBe('2026-10-04T09:00:00.000Z')
    expect(loaded?.plans[0].finalizeHistory).toEqual([{ action: 'finalize', at: '2026-10-04T09:00:00.000Z' }])
  })
})
