import React, { useState } from 'react';
import { UploadItem, User, AuditLogEntry } from '../types';
import PreviewModal from './PreviewModal';

interface AdminTabProps {
  uploads: UploadItem[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  currentUser: User | null;
  onAdminLogin: (adminCode: string) => void;
  onAdminLogout: () => void;
  onCreateAdmin: (adminCode: string) => void;
  onChangeAdminCode: (newCode: string) => void;
  adminUsers: User[];
  auditLog: AuditLogEntry[];
  impersonatingFrom: User | null;
  onImpersonateStart: (adminCode: string) => void;
  onImpersonateStop: () => void;
  onDeleteAdmin: (adminCode: string) => void;
}

const PendingItem: React.FC<{ item: UploadItem, onApprove: (id: number) => void, onReject: (id: number) => void, onPreview: (url: string) => void }> = ({ item, onApprove, onReject, onPreview }) => (
  <li className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex-grow">
      <h3 className="font-semibold text-slate-100">{item.title}</h3>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">
        {item.url}
      </a>
    </div>
    <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
       <button 
        onClick={() => onPreview(item.url)}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
      >
        Preview
      </button>
      <button 
        onClick={() => onApprove(item.id)}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
      >
        Approve
      </button>
      <button 
        onClick={() => onReject(item.id)}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
      >
        Reject
      </button>
    </div>
  </li>
);

const AdminLogin: React.FC<{ onAdminLogin: (adminCode: string) => void }> = ({ onAdminLogin }) => {
  const [adminCode, setAdminCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onAdminLogin(adminCode);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-slate-100">Admin Login</h2>
      <p className="mt-2 text-center text-slate-400">Please enter your admin code to access the moderation panel.</p>
      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div>
          <label htmlFor="admin-code" className="block text-sm font-medium text-slate-300 mb-1">
            Admin Code
          </label>
          <input
            id="admin-code"
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Enter your admin code"
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-slate-100 placeholder:text-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login
        </button>
      </form>
    </div>
  );
};

const UserManagement: React.FC<{ onCreateAdmin: (adminCode: string) => void }> = ({ onCreateAdmin }) => {
    const [newAdminCode, setNewAdminCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAdminCode.trim()) {
            onCreateAdmin(newAdminCode.trim());
            setNewAdminCode('');
        }
    };

    return (
        <div className="mt-8">
            <h4 className="text-xl font-bold text-slate-100">User Management</h4>
            <p className="text-slate-400 mb-4">Create new standard admin users.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                <div className="w-full">
                    <label htmlFor="new-admin-code" className="block text-sm font-medium text-slate-300 mb-1">
                        New Admin Code
                    </label>
                    <input
                        id="new-admin-code"
                        type="text"
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value)}
                        placeholder="e.g., 445566"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-slate-100 placeholder:text-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 whitespace-nowrap"
                >
                    Create Admin
                </button>
            </form>
        </div>
    );
};

const OwnerSettings: React.FC<{ onChangeAdminCode: (newCode: string) => void }> = ({ onChangeAdminCode }) => {
    const [newCode, setNewCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCode.trim()) {
            onChangeAdminCode(newCode.trim());
            setNewCode('');
        }
    };

    return (
        <div className="mt-8">
            <h4 className="text-xl font-bold text-slate-100">Owner Settings</h4>
            <p className="text-slate-400 mb-4">Change your super-admin code.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                <div className="w-full">
                    <label htmlFor="new-owner-code" className="block text-sm font-medium text-slate-300 mb-1">
                        New Owner Code
                    </label>
                    <input
                        id="new-owner-code"
                        type="password"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Enter a new numeric code"
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 text-slate-100 placeholder:text-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-amber-600 rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 whitespace-nowrap"
                >
                    Change Code
                </button>
            </form>
        </div>
    );
};

const SuperAdminDashboard: React.FC<{
  adminUsers: User[];
  auditLog: AuditLogEntry[];
  onCreateAdmin: (adminCode: string) => void;
  onChangeAdminCode: (newCode: string) => void;
  onImpersonateStart: (adminCode: string) => void;
  onDeleteAdmin: (adminCode: string) => void;
}> = ({ adminUsers, auditLog, onCreateAdmin, onChangeAdminCode, onImpersonateStart, onDeleteAdmin }) => {
  const handleDelete = (adminCode: string) => {
    if (window.confirm(`Are you sure you want to delete admin "${adminCode}"? This action cannot be undone.`)) {
      onDeleteAdmin(adminCode);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-700 space-y-12">
        <h3 className="text-2xl font-bold text-slate-100">Super Admin Dashboard</h3>

        {/* Admin Users List */}
        <div>
            <h4 className="text-xl font-bold text-slate-100">Current Admins</h4>
            <p className="text-slate-400 mb-4">List of all registered admin users.</p>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                <ul className="divide-y divide-gray-700">
                    {adminUsers.map(user => (
                        <li key={user.adminCode} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <span className="font-mono text-slate-300">{user.adminCode}</span>
                                <span className={`ml-3 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    user.role === 'super-admin' 
                                    ? 'bg-purple-500/20 text-purple-300' 
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                            {user.role === 'admin' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onImpersonateStart(user.adminCode)}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition"
                                    >
                                        Login as
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.adminCode)}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Activity Log */}
        <div>
            <h4 className="text-xl font-bold text-slate-100">Activity Log</h4>
            <p className="text-slate-400 mb-4">A log of all moderation actions.</p>
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
                {auditLog.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                        {auditLog.map((log, index) => (
                            <li key={index} className="p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-sm text-slate-200">
                                            Admin <strong className="font-semibold text-indigo-400">{log.adminCode}</strong>{' '}
                                            <span className={log.action === 'approved' ? 'text-green-400' : 'text-red-400'}>
                                                {log.action}
                                            </span>{' '}
                                            submission: "{log.uploadTitle}"
                                        </p>
                                    </div>
                                    <div className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap text-right">
                                        {log.timestamp.toLocaleDateString()}
                                        <br/>
                                        {log.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-6 text-center text-slate-400">No admin activity recorded yet.</p>
                )}
            </div>
        </div>
        
        <UserManagement onCreateAdmin={onCreateAdmin} />
        <OwnerSettings onChangeAdminCode={onChangeAdminCode} />
    </div>
);
}

const AdminTab: React.FC<AdminTabProps> = ({ uploads, onApprove, onReject, currentUser, onAdminLogin, onAdminLogout, onCreateAdmin, onChangeAdminCode, adminUsers, auditLog, impersonatingFrom, onImpersonateStart, onImpersonateStop, onDeleteAdmin }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!currentUser) {
    return <AdminLogin onAdminLogin={onAdminLogin} />;
  }
  
  const pendingUploads = uploads.filter(item => item.status === 'pending');
  const isImpersonating = !!impersonatingFrom;

  return (
    <div>
        {isImpersonating && (
            <div className="mb-6 p-4 bg-yellow-900/50 text-yellow-200 rounded-lg border border-yellow-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>
                    You are currently impersonating admin <strong className="font-semibold text-yellow-100">{currentUser.adminCode}</strong>.
                </p>
                <button
                    onClick={onImpersonateStop}
                    className="px-4 py-2 font-semibold text-white bg-yellow-600 rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 whitespace-nowrap"
                >
                    Return to Super Admin
                </button>
            </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Moderation Panel</h2>
                <p className="text-slate-400">Logged in as <strong className="font-semibold text-indigo-400">{currentUser.adminCode}</strong> ({currentUser.role}).</p>
            </div>
            {!isImpersonating && (
                <button
                    onClick={onAdminLogout}
                    className="w-full sm:w-auto flex-shrink-0 px-4 py-2 font-semibold text-white bg-gray-600 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    aria-label="Logout from admin panel"
                >
                    Logout
                </button>
            )}
        </div>


      {pendingUploads.length > 0 ? (
        <ul className="space-y-4">
          {pendingUploads.map(item => (
            <PendingItem 
                key={item.id} 
                item={item} 
                onApprove={onApprove} 
                onReject={onReject} 
                onPreview={(url) => setPreviewUrl(url)}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-slate-300">All clear!</h3>
          <p className="text-slate-400 mt-1">There are no pending submissions to review.</p>
        </div>
      )}
      
      {currentUser.role === 'super-admin' && !isImpersonating && (
        <SuperAdminDashboard 
          adminUsers={adminUsers}
          auditLog={auditLog}
          onCreateAdmin={onCreateAdmin}
          onChangeAdminCode={onChangeAdminCode}
          onImpersonateStart={onImpersonateStart}
          onDeleteAdmin={onDeleteAdmin}
        />
      )}

      {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
};

export default AdminTab;