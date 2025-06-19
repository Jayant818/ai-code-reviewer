import { ISession } from "@/lib/hooks/useSession/useSession.types";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const getSessionHandler = async (req: NextRequest) => {
  const session = await getSession();
  return NextResponse.json(session);
};

const createSessionHandler = async (req: NextRequest, res: NextResponse) => {
  const payload: ISession = await req.json();

  try {
    const data = await createSession(payload);

    return NextResponse.json({ "message:": "success" });
  } catch (e) {
    return NextResponse.json({ "message:": "failed", error: e });
  }
};

const deleteSessionHandler = async (req: NextRequest) => {
  try {
    await deleteSession();
    return NextResponse.json({ "message:": "success" });
  } catch (e) {
    return NextResponse.json({ "message:": "failed", error: e });
  }
};

export {
  getSessionHandler as GET,
  createSessionHandler as POST,
  deleteSessionHandler as DELETE,
};
