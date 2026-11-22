// First Principles Questions ladder, brief record (U3, Nov 21, 2026).
// Decision: Richardson, the solo founder, uploads his own video plus scan,
// and the workflow turns it into an Environment Pack. No lab and no customer
// uploads anything. Upload is admin first, Richardson only.
// Claims: (1) Uploader is Richardson, solo founder, filming at home.
// Verified, stage1-package.md section 1. (2) Failed version, a lab or
// customer uploads: failed, research-report-v2.md section 2 names labs as
// buyers of a finished pack, not uploaders. (3) Buyer is a lab or robot
// company, cited, research-report-v2.md verdict and section 2. (4) No pack
// exists yet and no lab has paid yet, verified, research-report-v2.md
// section 5, gaps 1 and 2. (5) Pilot form saves to localStorage and sends
// nothing, verified by reading components/PilotForm.tsx.
// True facts: Richardson uploads his own capture. Labs buy a finished pack
// and eval report. Capture is MP4 H.264, 1920 by 1080, 30 fps, no audio,
// chest mount 1.35 m, 10 degrees down, scan LiDAR plus photogrammetry.
// Biggest open risk: the morning timeline is unproven, no pack has been
// built, so automatic steps may take far longer than the target times.
// What would change my mind: one pack built under this spec with real hours
// logged per step, plus one paid pilot at $7,500, concept price, from a
// named lab asking to upload its own place.

import { cookies } from "next/headers";
import UploadFlow from "../../components/UploadFlow";
import { SESSION_COOKIE, verifyToken } from "../../lib/auth";

export const instant = false;

export const metadata = {
  title: "Admin upload | WorldLoop",
  description: "Admin only. Richardson uploads a capture and the workflow starts.",
};

export default async function UploadPage() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token, "session") : null;
  return (
    <div className="min-h-full bg-white text-[#0b0b0c]">
      <header className="border-b border-[#e5e7eb]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <a href="/" className="text-lg font-semibold tracking-tight">WorldLoop</a>
          <div className="flex items-center gap-3 text-sm">
            <a href="/admin/account" className="text-[#5b5f66] hover:text-[#0b0b0c]">
              {session ? session.email : "Admin"}
            </a>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-[#5b5f66] hover:text-[#0b0b0c]">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <UploadFlow />
      </main>
    </div>
  );
}
