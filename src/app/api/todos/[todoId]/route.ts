import { NextResponse } from "next/server";
import { supabase } from "../../../../../supabaseClient";

// PUT /api/todos/[id]
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    const data = await request.json();
    const { content, is_completed } = data;

    if (!id || (content === undefined && is_completed === undefined)) {
      return NextResponse.json({ error: 'ID and data are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('todos')
      .update({ content, is_completed })
      .eq('id', id)

    if (error) throw error;

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error });
  }
}

// DELETE /api/todos/[id]
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error });
  }
}