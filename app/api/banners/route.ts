import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const banners = await db.getBanners(includeInactive);
    return NextResponse.json(banners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Banners array required' }, { status: 400 });
    }
    const updated = await db.updateBanners(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update banners' }, { status: 500 });
  }
}
