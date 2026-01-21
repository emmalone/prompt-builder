import { NextResponse } from 'next/server';
import { getAllProjects, getAllTemplates } from '@/lib/database';

export async function GET() {
  try {
    const projects = getAllProjects();
    const templates = getAllTemplates();
    return NextResponse.json({ projects, templates });
  } catch (error) {
    console.error('Error fetching state:', error);
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 });
  }
}
