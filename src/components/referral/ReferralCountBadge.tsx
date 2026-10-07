"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/api-client";

export default function ReferralCountBadge() {
  const { data } = useQuery({
    queryKey: queryKeys.referralMe(),
    queryFn: () => api.get("/referrals/me"),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });

  const count = data?.referralCount || 0;
  const threshold = data?.rewardThreshold || 3;

  return (
    <Card className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
        <Gift className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">People referred</p>
        <p className="text-lg font-black text-white leading-none">{count}</p>
      </div>
      {count > 0 && (
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">
          {count >= threshold ? "Reward ready" : `${threshold - count} to go`}
        </Badge>
      )}
    </Card>
  );
}
