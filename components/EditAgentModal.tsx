"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/lib/types";

interface Props {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSave: (agent: Agent) => void;
}

export default function EditAgentModal({
  open,
  agent,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [maxPerPayment, setMaxPerPayment] = useState("");

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setMonthlyLimit(agent.monthlyLimit);
      setMaxPerPayment(agent.maxPerPayment);
    }
  }, [agent]);

  if (!open || !agent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...agent,
      name: name.trim() || agent.name,
      monthlyLimit: monthlyLimit || agent.monthlyLimit,
      maxPerPayment: maxPerPayment || agent.maxPerPayment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Edit Agent</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"
              placeholder="Agent name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Monthly limit (USDC)
            </label>
            <input
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"
              placeholder="500"
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Max per payment (USDC)
            </label>
            <input
              value={maxPerPayment}
              onChange={(e) => setMaxPerPayment(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"
              placeholder="150"
              inputMode="decimal"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}