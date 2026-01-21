import { NextRequest, NextResponse } from 'next/server';
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { projectId, name } = await request.json();
    const prompt = createPrompt(projectId, name);
    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, projectId, field, value } = await request.json();
    updatePrompt(id, projectId, field, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, projectId } = await request.json();
    deletePrompt(id, projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
