import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  RefreshCw, 
  Smartphone, 
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { 
  getSyncKey, 
  setSyncKey, 
  clearSyncKey, 
  pushProgressToCloud, 
  pullProgressFromCloud 
} from '../utils/cloudSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [syncKeyInput, setSyncKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getSyncKey();
      setSavedKey(existing);
      setSyncKeyInput(existing || '');
      setLastSynced(localStorage.getItem('madinah_sync_last_synced'));
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndPush = async () => {
    const key = syncKeyInput.trim().toLowerCase();
    if (!key) {
      setStatusMessage({ type: 'error', text: 'Please enter a Sync Key (e.g. your nickname or a unique code)' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    setSyncKey(key);
    setSavedKey(key);

    const result = await pushProgressToCloud(key);
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: 'All progress successfully backed up to Cloudflare D1!' });
      setLastSynced(new Date().toISOString());
      onSyncCompleted();
    } else {
      setStatusMessage({ 
        type: 'error', 
        text: result.error || 'Failed to sync. Make sure your D1 database is bound to the Pages project.' 
      });
    }
  };

  const handlePullRestore = async () => {
    const key = syncKeyInput.trim().toLowerCase();
    if (!key) {
      setStatusMessage({ type: 'error', text: 'Please enter your Sync Key first' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const result = await pullProgressFromCloud(key);
    setIsLoading(false);

    if (result.success) {
      if (result.found) {
        setSyncKey(key);
        setSavedKey(key);
        setStatusMessage({ type: 'success', text: 'Progress restored! Refreshing data...' });
        setLastSynced(new Date().toISOString());
        setTimeout(() => {
          onSyncCompleted();
          window.location.reload();
        }, 1200);
      } else {
        setStatusMessage({ type: 'info', text: 'No existing cloud backup found for this Sync Key.' });
      }
    } else {
      setStatusMessage({ 
        type: 'error', 
        text: result.error || 'Failed to restore. Please check your key or D1 database status.' 
      });
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect this device from cloud sync? (Local progress will remain saved on this device).')) {
      clearSyncKey();
      setSavedKey(null);
      setSyncKeyInput('');
      setStatusMessage({ type: 'info', text: 'Device unlinked from cloud sync.' });
      onSyncCompleted();
    }
  };

  const generateRandomKey = () => {
    const nouns = ['arabic', 'madinah', 'talib', 'qalam', 'nur', 'kitab'];
    const randomWord = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSyncKeyInput(`${randomWord}-${randomNum}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cloud Sync (D1)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync exercises & bookmarks across Phone and PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Your Sync Key / Passphrase</span>
            <button
              onClick={generateRandomKey}
              type="button"
              className="text-[11px] text-emerald-600 hover:underline font-normal"
            >
              Generate Random
            </button>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={syncKeyInput}
              onChange={(e) => setSyncKeyInput(e.target.value)}
              placeholder="e.g. doxman or arabic-study-7"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Use the same key on your phone and laptop to share progress.
          </p>
        </div>

        {/* Multi-device Illustration */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Laptop className="w-4 h-4 text-emerald-600" />
            <span>PC</span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
          <div className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Phone</span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="leading-tight">{statusMessage.text}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSaveAndPush}
            disabled={isLoading}
            className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Backup to Cloud</span>
          </button>

          <button
            onClick={handlePullRestore}
            disabled={isLoading}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Restore Here</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            {lastSynced ? (
              <span>Last synced: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ) : (
              <span>Not synced yet</span>
            )}
          </div>
          {savedKey && (
            <button
              onClick={handleDisconnect}
              className="text-rose-500 hover:underline"
            >
              Unlink Device
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
