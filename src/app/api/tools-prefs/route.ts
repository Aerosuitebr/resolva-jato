import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import { readSessionFromCookies } from '@/lib/auth/session-cookie';

interface ToolsPrefsPayload {
  favoriteToolIds: string[];
  recentToolIds: string[];
  openCounts: Record<string, number>;
  pinnedCategoryId: string | null;
  collapsedCategories: string[];
  sectionsCustomized: boolean;
  wizardDismissed: boolean;
}

const DEFAULTS: ToolsPrefsPayload = {
  favoriteToolIds: [],
  recentToolIds: [],
  openCounts: {},
  pinnedCategoryId: null,
  collapsedCategories: [],
  sectionsCustomized: false,
  wizardDismissed: false
};

function serialize(row: {
  favoriteToolIds: Prisma.JsonValue;
  recentToolIds: Prisma.JsonValue;
  openCounts: Prisma.JsonValue;
  pinnedCategoryId: string | null;
  collapsedCategories: Prisma.JsonValue;
  sectionsCustomized: boolean;
  wizardDismissed: boolean;
} | null): ToolsPrefsPayload {
  if (!row) return DEFAULTS;
  return {
    favoriteToolIds: Array.isArray(row.favoriteToolIds) ? (row.favoriteToolIds as string[]) : [],
    recentToolIds: Array.isArray(row.recentToolIds) ? (row.recentToolIds as string[]) : [],
    openCounts:
      row.openCounts && typeof row.openCounts === 'object' && !Array.isArray(row.openCounts)
        ? (row.openCounts as Record<string, number>)
        : {},
    pinnedCategoryId: row.pinnedCategoryId,
    collapsedCategories: Array.isArray(row.collapsedCategories) ? (row.collapsedCategories as string[]) : [],
    sectionsCustomized: Boolean(row.sectionsCustomized),
    wizardDismissed: Boolean(row.wizardDismissed)
  };
}

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ authenticated: false, prefs: DEFAULTS });
    }
    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ authenticated: false, prefs: DEFAULTS });
    }
    const prisma = getPrisma();
    const row = await prisma.toolsPreference.findUnique({ where: { userId: session.sub } });
    return NextResponse.json({ authenticated: true, prefs: serialize(row) });
  } catch (error) {
    console.error('[tools-prefs:get]', error);
    return NextResponse.json({ authenticated: false, prefs: DEFAULTS });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Banco não configurado.' }, { status: 503 });
    }
    const session = readSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ToolsPrefsPayload>;
    const prisma = getPrisma();

    const data: Record<string, unknown> = {};
    if (body.favoriteToolIds !== undefined) data.favoriteToolIds = body.favoriteToolIds as Prisma.InputJsonValue;
    if (body.recentToolIds !== undefined) data.recentToolIds = body.recentToolIds as Prisma.InputJsonValue;
    if (body.openCounts !== undefined) data.openCounts = body.openCounts as Prisma.InputJsonValue;
    if (body.pinnedCategoryId !== undefined) data.pinnedCategoryId = body.pinnedCategoryId;
    if (body.collapsedCategories !== undefined)
      data.collapsedCategories = body.collapsedCategories as Prisma.InputJsonValue;
    if (body.sectionsCustomized !== undefined) data.sectionsCustomized = body.sectionsCustomized;
    if (body.wizardDismissed !== undefined) data.wizardDismissed = body.wizardDismissed;

    const row = await prisma.toolsPreference.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
        favoriteToolIds: (body.favoriteToolIds ?? DEFAULTS.favoriteToolIds) as Prisma.InputJsonValue,
        recentToolIds: (body.recentToolIds ?? DEFAULTS.recentToolIds) as Prisma.InputJsonValue,
        openCounts: (body.openCounts ?? DEFAULTS.openCounts) as Prisma.InputJsonValue,
        pinnedCategoryId: body.pinnedCategoryId ?? null,
        collapsedCategories: (body.collapsedCategories ?? DEFAULTS.collapsedCategories) as Prisma.InputJsonValue,
        sectionsCustomized: body.sectionsCustomized ?? false,
        wizardDismissed: body.wizardDismissed ?? false
      },
      update: data
    });

    return NextResponse.json({ authenticated: true, prefs: serialize(row) });
  } catch (error) {
    console.error('[tools-prefs:patch]', error);
    return NextResponse.json({ error: 'Não foi possível salvar as preferências.' }, { status: 500 });
  }
}
