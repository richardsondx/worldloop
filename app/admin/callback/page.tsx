import CallbackClient from "./CallbackClient";

export const instant = false;

export const metadata = {
  title: "Signing you in | WorldLoop",
  description: "Finishing your WorldLoop admin sign-in.",
};

// Magic redirects here after the user clicks the link in the email.
// CallbackClient completes the login in the browser.
export default function AdminCallbackPage() {
  return (
    <div className="min-h-full bg-white text-[#0b0b0c]">
      <header className="border-b border-[#e5e7eb]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="/" className="text-lg font-semibold tracking-tight">WorldLoop</a>
          <span className="rounded-full bg-[#0b0b0c] px-3 py-1 text-xs font-medium text-white">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-16 sm:px-8">
        <CallbackClient />
      </main>
    </div>
  );
}
