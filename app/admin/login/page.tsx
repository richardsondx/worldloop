import LoginForm from "./LoginForm";

export const instant = false;

export const metadata = {
  title: "Admin sign in | WorldLoop",
  description: "Sign in to the WorldLoop admin area with a sign-in code.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-full bg-white text-[#0b0b0c]">
      <header className="border-b border-[#e5e7eb]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="/" className="text-lg font-semibold tracking-tight">WorldLoop</a>
          <span className="rounded-full bg-[#0b0b0c] px-3 py-1 text-xs font-medium text-white">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-16 sm:px-8">
        <p className="section-label">Admin sign in</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">Sign in with a code</h1>
        <p className="mt-4 leading-7 text-[#5b5f66]">
          Enter your email and we will send you a 6-digit sign-in code. The code works
          once and stops working in 20 minutes. Only the WorldLoop admin
          address can sign in.
        </p>
        <LoginForm next={params.next ?? "/upload"} error={params.error} />
        <p className="mt-8 text-sm text-[#5b5f66]">
          No password to remember, no password to steal. The code is the key,
          and it dies in 20 minutes.
        </p>
      </main>
    </div>
  );
}
