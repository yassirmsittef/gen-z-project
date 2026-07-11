import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unreadCount } from "@/lib/notifications";

/** Compteur de non-lues pour le badge vivant de la navbar. */

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }
  const count = await unreadCount(session.user.id);
  return NextResponse.json({ count });
}
