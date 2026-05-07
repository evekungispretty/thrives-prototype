import type { Module } from '../types';
import { MODULES } from '../data/modules';

const _modules: Module[] = [...MODULES];
let _lastDeleted: { module: Module; index: number } | null = null;
let _lastBulkDeleted: { module: Module; index: number }[] | null = null;

export const moduleStore = {
  getAll: (): Module[] => [..._modules],
  getById: (id: string): Module | undefined => _modules.find(m => m.id === id),
  update: (updated: Module): void => {
    const idx = _modules.findIndex(m => m.id === updated.id);
    if (idx !== -1) _modules[idx] = updated;
  },
  add: (mod: Module): void => { _modules.push(mod); },
  delete: (id: string): void => {
    const idx = _modules.findIndex(m => m.id === id);
    if (idx !== -1) {
      _lastDeleted = { module: _modules[idx], index: idx };
      _modules.splice(idx, 1);
    }
  },
  bulkDelete: (ids: Set<string>): void => {
    _lastBulkDeleted = [];
    for (const id of ids) {
      const idx = _modules.findIndex(m => m.id === id);
      if (idx !== -1) {
        _lastBulkDeleted.push({ module: _modules[idx], index: idx });
        _modules.splice(idx, 1);
      }
    }
  },
  undoDelete: (): Module | null => {
    if (!_lastDeleted) return null;
    const { module, index } = _lastDeleted;
    _modules.splice(index, 0, module);
    _lastDeleted = null;
    return module;
  },
  undoBulkDelete: (): void => {
    if (!_lastBulkDeleted) return;
    // restore in reverse order so original indices stay valid
    for (const { module, index } of [..._lastBulkDeleted].reverse()) {
      _modules.splice(index, 0, module);
    }
    _lastBulkDeleted = null;
  },
};
