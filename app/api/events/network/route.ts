import { NextResponse } from 'next/server';
import { getNetworkEvents } from '@/lib/sdx-calendars';

/** Rebuild from the Luma calendars every ten minutes. */
export const revalidate = 600;

/** Every event the main SDx, SDxUCSD, and SDxSDSU calendars own, for the home page. */
export async function GET() {
  const { events, ok } = await getNetworkEvents();
  return NextResponse.json(
    { events, ok },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
  );
}
