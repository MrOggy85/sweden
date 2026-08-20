// Storage and wire shapes.
//
// The wire shapes (Avatar, User, Visit, PageProgress) are hand-duplicated in
// client/src/data/types.ts — edit both together, nothing enforces they stay in sync.
// Device is server-only and deliberately never crosses the wire: its id is a bearer
// credential.

import type { AnimalId, ColorId, PageId, VisitKind } from './content.ts';

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

export type Device = {
  id: string;
  userIds: string[];
  activeUserId: string | null;
  createdAt: number;
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
