import { NextRequest, NextResponse } from 'next/server';
import { createTemplate, updateTemplate, deleteTemplate, getAllTemplates } from '@/lib/database';

export async function GET() {
  try {
    const templates = getAllTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, content, type } = await request.json();
    const template = createTemplate(name, content, type);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, content } = await request.json();
    updateTemplate(id, name, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleted = deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Cannot delete default templates' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
