@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Manage Users</h1>
            <p class="text-slate-600">View, suspend, ban, or verify users.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Search</label>
                <input name="q" value="{{ request('q') }}" placeholder="Search users by name, email, or phone"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">All Statuses</option>
                    <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                    <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Suspended</option>
                    <option value="banned" {{ request('status') == 'banned' ? 'selected' : '' }}>Banned</option>
                </select>
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Filter
            </button>
        </form>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
<th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Email / Phone</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Badge</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Role</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">KYC</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listings</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($users as $user)
                    <tr class="group hover:bg-slate-50">
<td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                        {{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-900">{{ $user->name }}</p>
                                        @if ($user->username)
                                            <p class="text-xs text-slate-500">@{{ $user->username }}</p>
                                        @endif
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <p class="text-sm text-slate-900">{{ $user->email }}</p>
                                <p class="text-xs text-slate-500">{{ $user->phone }}</p>
                            </td>
                            <td class="px-6 py-4">
                                @if ($user->hasBadge())
                                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-{{ $user->badgeColor() }}-100 text-{{ $user->badgeColor() }}-700">
                                        {{ $user->badgeLabel() }}
                                    </span>
                                @else
                                    <span class="text-xs text-slate-400">—</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                    {{ $user->role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600' }}">
                                    {{ ucfirst($user->role ?? 'user') }}
                                </span>
                            </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $user->isActive() ? 'bg-emerald-100 text-emerald-600' : ($user->isBanned() ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600') }}">
                                {{ ucfirst($user->status ?? 'active') }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $user->isKycVerified() ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                {{ $user->isKycVerified() ? 'Verified' : 'Pending' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $user->listings->count() }}</td>
<td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <a href="{{ route('admin.users.edit', $user) }}" class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Edit">
                                    ✏️
                                </a>
                                <button onclick="toggleStatus({{ $user->id }}, '{{ $user->isActive() ? 'suspended' : 'active' }}')"
                                        class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                                        title="{{ $user->isActive() ? 'Suspend' : 'Activate' }}">
                                    {{ $user->isActive() ? '⏸️' : '▶️' }}
                                </button>
                                @if (!$user->isBanned())
                                    <button onclick="toggleStatus({{ $user->id }}, 'banned')"
                                            class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Ban">
                                        🚫
                                    </button>
                                @endif
                                @if ($user->role !== 'admin')
                                    <button onclick="toggleRole({{ $user->id }}, '{{ $user->role === 'admin' ? 'user' : 'admin' }}')"
                                            class="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                                            title="{{ $user->role === 'admin' ? 'Remove Admin' : 'Make Admin' }}">
                                        {{ $user->role === 'admin' ? '👑' : '🛡️' }}
                                    </button>
                                @endif
                                <form method="POST" action="{{ route('admin.users.destroy', $user) }}" onsubmit="return confirm('Delete this user?')" class="inline">
                                    @csrf @method('DELETE')
                                    <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                        🗑️
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-slate-500">No users found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $users->links() }}
    </div>
</div>

<script>
    function toggleStatus(userId, status) {
        if (!confirm('Change user status to ' + status + '?')) return;
        fetch('{{ route('admin.users.status', 0) }}'.replace('0', userId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ status: status })
        }).then(() => location.reload());
    }
    function toggleRole(userId, role) {
        if (!confirm('Change user role to ' + role + '?')) return;
        fetch('{{ route('admin.users.role', 0) }}'.replace('0', userId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ role: role })
        }).then(() => location.reload());
    }
</script>
@endsection

