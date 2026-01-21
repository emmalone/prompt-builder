import { NextResponse } from 'next/server';
import { exportAllData } from '@/lib/database';

export async function GET() {
  try {
    const data = exportAllData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
