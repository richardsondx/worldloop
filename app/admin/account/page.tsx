import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_DAYS, verifyToken } from "../../../lib/auth";

export const instant = false;

export const metadata = {
  title: "Your account | WorldLoop",
  description: "The WorldLoop admin account.",
};

// The one admin account. No list, no roles, no other users.
export default async function AccountPage() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token, "session") : null;
  if (!session) redirect("/admin/login?next=/admin/account");

  const expires = new Date(session.exp).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-full bg-white text-[#0b0b0c]">
      <header className="border-b border-[#e5e7eb]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="/" className="text-lg font-semibold tracking-tight">WorldLoop</a>
          <span className="rounded-full bg-[#0b0b0c] px-3 py-1 text-xs font-medium text-white">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-16 sm:px-8">
        <p className="section-label">Your account</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">Signed in</h1>
        <div className="mt-8 rounded-3xl border border-[#e5e7eb] p-6">
          <p className="text-sm text-[#5b5f66]">Email</p>
          <p className="mt-1 text-lg font-medium">{session.email}</p>
          <p className="mt-5 text-sm text-[#5b5f66]">Sign-in method</p>
          <p className="mt-1 text-lg font-medium">Magic link, no password</p>
          <p className="mt-5 text-sm text-[#5b5f66]">Session ends</p>
          <p className="mt-1 text-lg font-medium">{expires} ({SESSION_DAYS} days)</p>
          <p className="mt-5 text-sm text-[#5b5f66]">Who else can sign in</p>
          <p className="mt-1 text-lg font-medium">Nobody. This is the only account.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/upload" className="rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8]">
            Go to upload
          </a>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-full bg-white px-6 py-3 text-base font-medium ring-1 ring-black/15 hover:bg-[#f6f7f9]">
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
