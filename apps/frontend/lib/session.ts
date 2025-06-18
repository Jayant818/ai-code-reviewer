"use server";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { EXPIRES_IN } from "./constants";
import { redirect } from "next/navigation";

export type Session = {
  user: {
    id: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Session) {
  const token = await new SignJWT(payload)
    .setExpirationTime(EXPIRES_IN)
    .setIssuedAt()
    .setProtectedHeader({ alg: "HS256" })
    .sign(encodedKey);

  return token;
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) return null;
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;
  } catch (e) {
    console.error("Error decrypting session:", e);
    return null;
  }
}

export async function createSession(payload: Session) {
  const session = await encrypt(payload);

  const _cookies = await cookies();

  _cookies.set("session", session, {
    sameSite: "lax",
    secure: true,
    httpOnly: true,
    expires: EXPIRES_IN,
    path: "/",
  });
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const payload = await decrypt(session);

    return payload;
  } catch (e) {
    console.error("Error verifying session", e);
    redirect("/");
  }
}

export async function updateSession({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const payload = await decrypt(session);

    if (!session || !payload) {
      return null;
    }

    const newPayload: Session = {
      user: {
        ...payload.user,
      },
      accessToken,
      refreshToken,
    };

    await createSession(newPayload);
  } catch (e) {
    console.error("Error updating session", e);
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
