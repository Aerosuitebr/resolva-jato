import { NextResponse } from 'next/server';
import { getPublicStats } from '@/lib/public-stats';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  const stats = await getPublicStats();
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
