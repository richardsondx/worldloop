"use client";

import { useEffect, useState } from "react";

// Pilot request form. This demo form saves your request in this browser
// only (localStorage). It does not send email and does not leave your
// device. A live form would post to a pilot queue.
const KEY = "worldloop-pilot-request";

export default function PilotForm() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    lab: "",
    robot: "",
    task: "",
    place: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(true);
    } catch {
      // Storage off: the form still works, it just does not remember.
    }
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...form, at: new Date().toISOString() }));
    } catch {
      // Storage off: show the same confirmation, the request stays on screen.
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="rounded-2xl bg-[#dcfce7] p-6">
        <p className="text-xl font-medium">Your pilot request is saved on this device.</p>
        <p className="mt-2 leading-7 text-[#5b5f66]">
          In the live site this goes to the WorldLoop pilot queue, and you get a
          reply within 2 working days with a time to walk your place. This demo
          form sends nothing, so nothing leaves your browser.
        </p>
        <button
          type="button"
          onClick={() => setSaved(false)}
          className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/10"
        >
          Edit the request
        </button>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-base outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#dbeafe]";
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">
        Your name
        <input required value={form.name} onChange={set("name")} className={`${input} mt-1`} placeholder="Ada Lovelace" autoComplete="name" />
      </label>
      <label className="block text-sm font-medium">
        Work email
        <input required type="email" value={form.email} onChange={set("email")} className={`${input} mt-1`} placeholder="ada@yourlab.ai" autoComplete="email" />
      </label>
      <label className="block text-sm font-medium">
        Lab or company
        <input required value={form.lab} onChange={set("lab")} className={`${input} mt-1`} placeholder="Your lab" autoComplete="organization" />
      </label>
      <label className="block text-sm font-medium">
        Your robot
        <input required value={form.robot} onChange={set("robot")} className={`${input} mt-1`} placeholder="Arm, humanoid, mobile manipulator" />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        The task you need tested
        <input required value={form.task} onChange={set("task")} className={`${input} mt-1`} placeholder="Pick up the blue mug and place it on the tray" />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        The place it has to work in
        <textarea value={form.place} onChange={set("place")} rows={2} className={`${input} mt-1`} placeholder="One kitchen counter, one factory cell, one hotel laundry room" />
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="rounded-full bg-[#1d4ed8] px-6 py-3 text-base font-medium text-white hover:bg-[#1e40af]">
          Request a free pilot
        </button>
        <p className="mt-3 text-sm text-[#5b5f66]">
          Saved in this browser only. No email is sent from this demo form.
        </p>
      </div>
    </form>
  );
}
