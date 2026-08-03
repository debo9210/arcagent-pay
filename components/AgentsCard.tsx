"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Play, Pause, Pencil } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "active" | "paused";
  monthlyLimit: string;
  maxPerPayment: string;
  spentThisMonth: string;
}

interface Props {
  agents: Agent[];
  onCreateAgent: () => void;
  onRunAgent: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEditAgent: (agent: Agent) => void;
  isLoading: boolean;
}

export default function AgentsCard({
  agents,
  onCreateAgent,
  onRunAgent,
  onToggleStatus,
  onEditAgent,
  isLoading,
}: Props) {
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
                className="p-4 bg-zinc-900 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{agent.name}</p>
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

                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Monthly limit: ${agent.monthlyLimit}</p>
                  <p>Max per payment: ${agent.maxPerPayment}</p>
                  <p>Spent this month: ${agent.spentThisMonth}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onRunAgent(agent.id)}
                    disabled={isLoading || agent.status !== "active"}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Run
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleStatus(agent.id)}
                  >
                    {agent.status === "active" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditAgent(agent)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}