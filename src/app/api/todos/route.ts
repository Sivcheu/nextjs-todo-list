import { NextResponse } from "next/server";
import { supabase } from "../../../../supabaseClient";

// GET /api/todos
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}

// POST /api/todos
export async function POST(request: Request) {
  try {
    const input = await request.json();
    const content = input.content;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({ content })
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error });
  }
}