                     <Link to="/settings" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                       <SettingsIcon className="w-4 h-4 text-purple-400" />
                       <span>{t('settings')}</span>
                     </Link>
                     <Link to="/saved-searches" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800 rounded-xl text-slate-200 font-bold transition-colors">
                       <Save className="w-4 h-4 text-blue-400" />
                       <span>Saved Searches</span>
                     </Link>
                     {isAdmin && (