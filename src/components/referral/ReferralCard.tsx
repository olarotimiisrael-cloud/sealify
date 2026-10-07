"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Check, Share2, Gift, Users, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/api-client";

export default function ReferralCard() {
  const { data: referral, isLoading } = useQuery({
    queryKey: queryKeys.referralMe(),
    queryFn: () => api.get("/referrals/me"),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });

  const [copied, setCopied] = useState(false);

  const link = referral?.referralLink || "";
  const count = referral?.referralCount || 0;
  const threshold = referral?.rewardThreshold || 3;
  const progress = Math.min(100, Math.round((count / threshold) * 100));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const share = (provider: string) => {
    const text = `Join me on Sealify — ${link}`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    };
    window.open(urls[provider] || link, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-48" />
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-4 bg-slate-800 rounded w-32" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] space-y-6 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Referrals</h2>
          <p className="text-xs text-slate-400">Share your link and earn rewards</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your invite link</label>
        <div className="flex gap-2">
          <Input readOnly value={link} className="bg-slate-950 border-slate-800 text-white text-xs" />
          <Button size="icon" variant="outline" onClick={copy} className="border-slate-700 text-slate-300">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => share("whatsapp")} className="border-slate-700 text-slate-300">
          WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={() => share("x")} className="border-slate-700 text-slate-300">
          X
        </Button>
        <Button size="sm" variant="outline" onClick={() => share("facebook")} className="border-slate-700 text-slate-300">
          Facebook
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold">Progress to free month</span>
          <span className="text-white font-black">{count} / {threshold}</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
        <p className="text-[11px] text-slate-500">
          {count >= threshold
            ? "You may be eligible for a reward — approval is at the sole discretion of the Root System Admin."
            : `${threshold - count} more referral${(threshold - count) !== 1 ? "s" : ""} to your next reward.`}
        </p>
      </div>

      <Alert className="bg-amber-500/5 border-amber-500/20">
        <Award className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-300 text-xs font-black">Referral reward</AlertTitle>
        <AlertDescription className="text-[11px] text-amber-200/80 mt-1">
          Successful referrals may qualify you for <strong>one (1) month of free promotional ad listings</strong>.
          Final approval of any referral reward is at the sole discretion of the Root System Admin.
          Rewards are not guaranteed or automatic.
        </AlertDescription>
      </Alert>

      {referral?.referrals?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> People you referred
          </h3>
          <div className="space-y-1">
            {referral.referrals.slice(0, 10).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  {r.refereeAvatarUrl ? (
                    <img src={r.refereeAvatarUrl} className="w-6 h-6 rounded-full border border-slate-700" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                      {(r.refereeName || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-white truncate">{r.refereeName || "A Sealify user"}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
