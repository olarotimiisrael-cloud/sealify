"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Search, Users as UsersIcon, TrendingUp, Award, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  getReferralStats,
  listAdminReferrals,
  getUserReferrals,
  grantReferralReward,
  resetReferralCount,
} from "@/lib/admin-api";
import GrantReferralRewardDialog from "./GrantReferralRewardDialog";
import { queryKeys } from "@/lib/api-client";

export default function AdminReferralsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: queryKeys.adminReferralStats(),
    queryFn: getReferralStats,
    staleTime: 1000 * 60,
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: queryKeys.adminReferrals({ search }),
    queryFn: () => listAdminReferrals({ search, limit: "50", offset: "0" }),
    staleTime: 1000 * 60,
  });

  const { data: userDetail, refetch: refetchUserDetail } = useQuery({
    queryKey: queryKeys.adminReferralUser(selectedUserId || ""),
    queryFn: () => getUserReferrals(selectedUserId!),
    enabled: !!selectedUserId,
    staleTime: 1000 * 30,
  });

  const grantMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => grantReferralReward(userId, data),
    onSuccess: () => {
      toast.success("Reward granted");
      refetchStats();
      refetchUsers();
      refetchUserDetail();
      setSelectedUserId(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to grant reward");
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => resetReferralCount(userId, data),
    onSuccess: () => {
      toast.success("Referral count reset");
      refetchStats();
      refetchUsers();
      refetchUserDetail();
      setSelectedUserId(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reset");
    },
  });

  const users = useMemo(() => usersData?.users || [], [usersData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Referrals" value={stats?.totalReferrals ?? "-"} icon={UsersIcon} color="from-blue-500 to-cyan-500" />
        <StatCard label="Referring Users" value={stats?.referringUsers ?? "-"} icon={TrendingUp} color="from-emerald-500 to-teal-500" />
        <StatCard label="Reward Ready" value={stats?.rewardEligibleUsers ?? "-"} icon={Award} color="from-amber-500 to-orange-500" />
        <StatCard label="Rewards Granted" value={stats?.rewardsGranted ?? "-"} icon={Gift} color="from-pink-500 to-rose-500" />
      </div>

      <Card className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or referral code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Referral Code</th>
                <th className="text-left py-2 px-2">Count</th>
                <th className="text-left py-2 px-2">Cycle</th>
                <th className="text-left py-2 px-2">Referred By</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No users found</td></tr>
              ) : (
                users.map((u: any) => {
                  const eligible = (u.referral_count || 0) >= (stats?.referralThreshold || 3);
                  return (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 px-2">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{u.full_name || "—"}</span>
                          <span className="text-slate-500">{u.auth_email}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 font-mono text-slate-300">{u.referral_code || "—"}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-black">{u.referral_count || 0}</span>
                          {eligible && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">Ready</Badge>}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{u.referral_cycle || 1}</td>
                      <td className="py-2 px-2 text-slate-400">{u.referrer_name ? `${u.referrer_name} (${u.referrer_referral_code})` : "—"}</td>
                      <td className="py-2 px-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-300 h-7 text-[10px]"
                          onClick={() => setSelectedUserId(u.id)}
                        >
                          <Award className="w-3 h-3 mr-1" /> Grant
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUserId && (
        <GrantReferralRewardDialog
          userId={selectedUserId}
          user={userDetail?.profile ? { id: selectedUserId, fullName: users.find((u: any) => u.id === selectedUserId)?.full_name } : null}
          referralDetail={userDetail}
          threshold={stats?.referralThreshold || 3}
          onClose={() => setSelectedUserId(null)}
          onGrant={(data) => grantMutation.mutate({ userId: selectedUserId, data })}
          onReset={(data) => resetMutation.mutate({ userId: selectedUserId, data })}
          isGranting={grantMutation.isPending}
          isResetting={resetMutation.isPending}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <Card className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </Card>
  );
}
