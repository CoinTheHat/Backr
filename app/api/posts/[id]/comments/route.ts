import { db } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const result = await db.comments.getByPost(id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { userAddress, content } = body;

        if (!userAddress || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await db.comments.create({
            postId: id,
            userAddress,
            content
        });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
