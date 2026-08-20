// Hand-duplicated from api/db/types.ts — edit both together, nothing enforces they stay
// in sync. Only the wire shapes are mirrored here; Device is server-only.

import type { AnimalId, ColorId, PageId, VisitKind } from './pages';

export type { AnimalId, ColorId, PageId, VisitKind };

export type Avatar = {
  animal: AnimalId;
  color: ColorId;
};

export type User = {
  id: string;
  name: string;
  avatar: Avatar;
  createdAt: number;
  updatedAt: number;
  version: 1;
};

export type Visit = {
  pageId: PageId;
  kind: VisitKind;
  at: number;
  ms?: number;
  score?: number;
};

export type PageProgress = {
  pageId: string;
  count: number;
  lastAt: number;
};

export type Me = {
  user: User | null;
  profiles: User[];
};
