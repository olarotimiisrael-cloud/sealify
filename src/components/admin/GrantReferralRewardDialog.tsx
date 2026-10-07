"use client";

import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, AlertTriangle } from "lucide-react";

interface Props {
  userId: string;
  user: { id: string; fullName?: string } | null;
  referralDetail: any;
  threshold: number;
  onClose: () => void;
  onGrant: (data: { note?: string; override?: boolean; confirm: boolean }) => void;
  onReset: (data: { confirm: boolean }) => void;
  isGranting: boolean;
  isResetting: boolean;
}

export default function GrantReferralRewardDialog({ userId, user, referralDetail, threshold, onClose, onGrant, onReset, isGranting, isResetting }: Props) {
  const [note, setNote] = useState("");
  const [override, setOverride] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [mode, setMode] = useState<"grant" | "reset">("grant");

  const profile = referralDetail?.profile;
  const currentCount = profile?.referral_count || 0;
  const eligible = currentCount >= threshold;

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-slate-900 border border-slate-800 text-white max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            {mode === "grant" ? "Grant referral reward" : "Reset referral count"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {user?.fullName || userId} — cycle {profile?.referral_cycle || 1}, {currentCount} referrals (threshold {threshold})
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!eligible && mode === "grant" && (
          <Alert className="bg-rose-500/5 border-rose-500/20">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <AlertTitle className="text-rose-300 text-xs font-black">Below threshold</AlertTitle>
            <AlertDescription className="text-rose-200/80 text-xs">
              This user has {currentCount} referrals; threshold is {threshold}. Enable override below to grant anyway.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for granting / resetting..."
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>

          {mode === "grant" && (
            <div className="flex items-center justify-between py-2">
              <Label className="text-slate-300 text-xs">Override threshold</Label>
              <Switch checked={override} onCheckedChange={setOverride} />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">Type "{mode === "grant" ? "GRANT" : "RESET"}" to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={mode === "grant" ? "Type GRANT to confirm" : "Type RESET to confirm"}
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="border-slate-700 text-slate-300">Cancel</Button>
          </AlertDialogCancel>
          {mode === "grant" ? (
            <Button
              onClick={() => onGrant({ note, override, confirm: confirmText === "GRANT" })}
              disabled={isGranting || confirmText !== "GRANT"}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
            >
              {isGranting ? "Granting..." : "Grant reward & reset"}
            </Button>
          ) : (
            <Button
              onClick={() => onReset({ confirm: confirmText === "RESET" })}
              disabled={isResetting || confirmText !== "RESET"}
              variant="destructive"
            >
              {isResetting ? "Resetting..." : "Reset count"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setMode(mode === "grant" ? "reset" : "grant")} className="text-slate-400">
            Switch to {mode === "grant" ? "Reset only" : "Grant + reset"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
