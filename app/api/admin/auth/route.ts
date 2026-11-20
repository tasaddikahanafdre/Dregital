import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password, email } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPassword) {
      // In a production app, set a signed HTTP-only cookie or JWT token
      return NextResponse.json({
        success: true,
        user: {
          role: 'admin',
          email: email || 'admin@dregital.com',
          name: 'Dregital Administrator'
        }
      });
    }

    return NextResponse.json({ error: 'Invalid administrator password' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
