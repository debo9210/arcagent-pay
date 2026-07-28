"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "active" | "paused";
  monthlyLimit: string;
}

interface Props {
  agents: Agent[];
  onCreateAgent: () => void;
}

export default function AgentsCard({ agents, onCreateAgent }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          My Payment Agents
        </CardTitle>
        <Button size="sm" onClick={onCreateAgent}>
          <Plus className="w-4 h-4 mr-1" />
          New Agent
        </Button>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">
            No agents yet. Create your first payment agent.
          </p>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl"
              >
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-zinc-400">
                    Limit: ${agent.monthlyLimit}/month
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    agent.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}