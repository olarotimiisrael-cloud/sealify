<div className="flex items-center gap-2 flex-wrap">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'all')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="restricted">Restricted</option>
                  </select>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as 'buyer' | 'seller' | 'admin' | 'all')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value as 'all' | 'true' | 'false')} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    <option value="all">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                  <button onClick={() => { setSelectedUser({} as UserProfile); setIsEditUserOpen(true); }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>