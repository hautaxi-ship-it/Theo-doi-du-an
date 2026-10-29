'use client';

import React, { useState, useEffect } from 'react';
import { getStoredFirebaseConfig, saveFirebaseConfig, removeFirebaseConfig, isFirebaseConfigured, FirebaseConfig } from '@/lib/firebase';
import { X, Database, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Key } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredFirebaseConfig();
      if (cfg) {
        setApiKey(cfg.apiKey || '');
        setAuthDomain(cfg.authDomain || '');
        setProjectId(cfg.projectId || '');
        setStorageBucket(cfg.storageBucket || '');
        setMessagingSenderId(cfg.messagingSenderId || '');
        setAppId(cfg.appId || '');
      }
      setConfigured(isFirebaseConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };
    saveFirebaseConfig(config);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Bạn muốn xóa cấu hình Firebase và quay về chế độ Mock Data Offline?')) {
      removeFirebaseConfig();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Cấu hình Firebase SDK & Fallback</h2>
              <p className="text-xs text-slate-400">Firebase Authentication & Cloud Firestore</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-bold">
                {configured
                  ? 'Đang kết nối Firebase Live Service'
                  : 'Chế độ Fallback thông minh: Mock Data & Local Storage đang kích hoạt'}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                {configured
                  ? 'Dữ liệu đang được đồng bộ và xác thực qua Firebase Project đã đăng ký.'
                  : 'Hệ thống tự động kích hoạt bộ Mock Data chuyên sâu cho khối Cơ khí & TBCD (THCK, TBCD, NMK), cho phép bạn trải nghiệm và kiểm thử ngay lập tức mà không cần điền API key! Khi cần triển khai production, bạn chỉ cần điền thông tin bên dưới.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">
                API Key (Firebase Web API Key)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="thaco-mfg-tracker"
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project-id.firebaseapp.com"
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="project-id.appspot.com"
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:1234567890:web:abcdef"
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {configured ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                Xóa cấu hình & Dùng Mock Data
              </button>
            ) : (
              <div className="text-[11px] text-slate-400">
                Lưu vào trình duyệt để test kết nối Firebase thật.
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/30 transition"
              >
                Lưu & Kích hoạt Firebase
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
