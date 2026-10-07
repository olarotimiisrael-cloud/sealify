import React, { useEffect, useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';
import { ShieldCheck, Clock, Info, User, Settings } from 'lucide-react';

interface VerificationBadgeProps {
  userId?: string;
  onChange?: (verified: boolean) => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ userId, onChange }) => {
  const { user, isLoading } = useSealify();
  const [badges, setBadges] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeBadge, setActiveBadge] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = userId || user?.id;
    if (!fetchUser) return;

    // Mock badges list - in production would fetch from API
    const mockBadges = [
      {
        id: 'govt_id',
        name: 'Government ID',
        type: 'government_id',
        issuingAuthority: 'NIMC',
        isPublic: true,
        criteria: 'Submit valid National Identification Number (NIN)',
      },
      {
        id: 'professional',
        name: 'Professional Certification',
        type: 'professional_certification',
        issuingAuthority: 'ICAN/COREN',
        isPublic: true,
        criteria: 'Submit professional certification documents',
      },
      {
        id: 'skill_valid',
        name: 'Skill Validation',
        type: 'skill_validation',
        issuingAuthority: 'Sealify Platform',
        isPublic: true,
        criteria: 'Complete platform skill assessment',
      },
      {
        id: 'corporate',
        name: 'Corporate Verification',
        type: 'corporate_verification',
        issuingAuthority: 'Corporate Registry',
        isPublic: false,
        criteria: 'Business CAC registration verification',
      },
    ];

    const mockRequests = [
      {
        id: 'req1',
        badgeId: 'govt_id',
        status: 'pending',
        requestDate: new Date(),
        notes: 'NIN verification request submitted',
      },
    ];

    setBadges(mockBadges);
    setRequests(mockRequests);
  }, [fetchUser]);

  const handleVerifyBadge = async (badgeId: string) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    setShowRequestModal(true);
    setActiveBadge(badges.find(b => b.id === badgeId) || null);
  };

  const submitVerificationRequest = async (credentialId?: string, issuer?: string, notes?: string) => {
    if (!activeBadge || !userId) return;

    try {
      const { data, error } = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeId: activeBadge.id,
          userId,
          credentialId,
          issuer: issuer || activeBadge.issuingAuthority,
          requestNotes: notes,
        }),
      }).then(res => res.json());

      if (error) throw new Error(error.message || 'Failed to submit verification request');

      toast.success('Verification request submitted successfully!');
      setShowRequestModal(false);
      setActiveBadge(null);

      // Refresh requests list
      setRequests(prev => [...prev, {
        id: Date.now().toString(),
        badgeId: activeBadge.id,
        status: 'pending',
        requestDate: new Date(),
        notes: notes || 'New verification request submitted',
      }]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit verification request');
    }
  };

  const formatRequestStatus = (status: string) => {
    const statuses: any = {
      pending: 'Pending Review',
      under_review: 'Under Review',
      approved: '✓ Approved',
      rejected: '✗ Rejected',
    };
    return statuses[status] || status;
  };

  const formatStatusColor = (status: string) => {
    const colors: any = {
      pending: 'text-amber-400',
      under_review: 'text-amber-400',
      approved: 'text-emerald-500',
      rejected: 'text-rose-500',
    };
    return colors[status] || 'text-slate-500';
  };

  return (
    <div className="w-72 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white tracking-wider">Trust & Verification</h3>
          <p className="text-sm text-slate-400">Show your credibility to buyers and clients</p>
        </div>
        {onChange && (
          <button onClick={() => onChange(user?.verified || false)} className="text-xs text-slate-500 hover:text-emerald-400">
            Update Status
          </button>
        )}
      </div>

      {/* Display Earned Badges */}
      {badges.map((badge) => {
        const hasVerification = requests?.some(
          (r: any) => r.badgeId === badge.id && r.status === 'approved'
        );

        return (
          <div
            key={badge.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              hasVerification
                ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border border-slate-700 text-slate-300'}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              {badge.type === 'government_id' && (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
              {badge.type === 'professional' && (
                <User className="w-5 h-5 text-amber-400" />
              )}
              {badge.type === 'skill_valid' && (
                <Settings className="w-5 h-5 text-emerald-400" />
              )}
              {badge.type === 'corporate' && (
                <User className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-100 line-clamp-1">{badge.name}</p>
              <p className="text-xs text-slate-400">{badge.issuingAuthority}</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                hasVerification ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {hasVerification ? 'Verified' : 'Request Pending'}
            </span>
          </div>
        );
      })}

      {/* Display Pending Requests */}
      {requests?.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800 text-xs">
          {requests.map((req: any) => (
            <div key={req.id} className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                req.status === 'approved' ? 'bg-emerald-500' :
                req.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
              }}` />
              <span className="text-slate-300 text-xs">${formatRequestStatus(req.status)}</span>
              <span className="text-slate-500 text-xs ml-2 small">(${new Date(req.requestDate).toLocaleDateString('en-NG')})</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <button
          onClick={() => handleVerifyBadge('govt_id')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activeBadge?.id === 'govt_id' ? 'Editing Government ID...' : 'Verify Government ID'}
        </button>
        <button
          onClick={() => handleVerifyBadge('professional')}
          className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
        >
          Verify Professional Certification
        </button>
        <button
          onClick={() => handleVerifyBadge('skill_valid')}
          className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
        >
          Complete Skill Assessment
        </button>
        <button
          onClick={() => setShowRequestModal(true)}
          className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {activeBadge?.id === 'govt_id' ? 'Submitting...' : 'Request Verification'}
        </button>
      </div>

      {/* Modal for Verification Request */}
      {showRequestModal && activeBadge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white tracking-wider">
                {activeBadge.name} Verification Request
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="p-2 rounded-xl hover:bg-slate-800">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Badge Display */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-xl bg-slate-800 mx-auto flex items-center justify-center mb-3">
                  {activeBadge.type === 'government_id' && (
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  )}
                  {activeBadge.type === 'professional' && (
                    <User className="w-8 h-8 text-amber-400" />
                  )}
                </div>
                <p className="text-lg font-black text-white">{activeBadge.name}</p>
                <p className="text-sm text-slate-400">{activeBadge.issuingAuthority}</p>
              </div>

              {/* Form Fields */}
              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-2">Credential ID (NIN, CAC, etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. NG-123-456-789"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 mb-4"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-2">Issuing Authority</label>
                <input
                  type="text"
                  value={activeBadge.issuingAuthority}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  readOnly
                  placeholder={activeBadge.issuingAuthority}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-2">Verification Notes (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-y mb-4"
                  placeholder="Any additional notes for the reviewer..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitVerificationRequest()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};