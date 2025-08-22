import React, { useState, useEffect, useCallback } from 'react';
import { Tab, UploadItem, AlertMessage, User, AuditLogEntry } from './types';
import MainTab from './components/MainTab';
import CommunityTab from './components/CommunityTab';
import AdminTab from './components/AdminTab';
import Tabs from './components/Tabs';
import Alert from './components/Alert';

const BackgroundAnimation: React.FC = () => (
    <div className="background-shapes" aria-hidden="true">
        <div className="shape" style={{ left: '10%', width: '80px', height: '80px', animationDelay: '0s' }}></div>
        <div className="shape" style={{ left: '20%', width: '30px', height: '30px', animationDelay: '2s', animationDuration: '17s' }}></div>
        <div className="shape" style={{ left: '25%', width: '50px', height: '50px', animationDelay: '4s' }}></div>
        <div className="shape" style={{ left: '40%', width: '60px', height: '60px', animationDelay: '0s', animationDuration: '22s' }}></div>
        <div className="shape" style={{ left: '55%', width: '20px', height: '20px', animationDelay: '0s', animationDuration: '20s' }}></div>
        <div className="shape" style={{ left: '65%', width: '110px', height: '110px', animationDelay: '0s' }}></div>
        <div className="shape" style={{ left: '75%', width: '150px', height: '150px', animationDelay: '3s', animationDuration: '18s' }}></div>
        <div className="shape" style={{ left: '90%', width: '35px', height: '35px', animationDelay: '7s' }}></div>
    </div>
);


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [uploads, setUploads] = useState<UploadItem[]>([
      { id: 1, title: 'Awesome Design Resources', url: 'https://example.com/designs', status: 'approved', description: 'A collection of great design tools.' },
      { id: 2, title: 'React Best Practices', url: 'https://example.com/react-bp', status: 'pending', description: 'Guide to writing better React code.' },
      { id: 3, title: 'Another Pending Item', url: 'https://example.com/another-pending', status: 'pending', description: 'Awaiting moderation.'},
      { id: 4, title: 'Tailwind CSS Cheatsheet', url: 'https://example.com/tailwind-cheats', status: 'approved', description: 'A handy reference for Tailwind classes.'}
  ]);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([
    { adminCode: '1104', role: 'super-admin' }
  ]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [impersonatingFrom, setImpersonatingFrom] = useState<User | null>(null);


  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleUpload = useCallback((url: string) => {
    const newUpload: UploadItem = {
      id: Date.now(),
      title: url.replace(/^https?:\/\//, '').split('/')[0] || url,
      url: url,
      status: 'pending',
      description: 'A new user submission.'
    };
    setUploads(prevUploads => [newUpload, ...prevUploads]);
    setAlert({ message: 'Upload successful! Your submission is pending approval.', type: 'success' });
    setActiveTab('community');
  }, []);

  const handleApprove = useCallback((id: number) => {
    let approvedItem: UploadItem | undefined;
    setUploads(prevUploads =>
      prevUploads.map(item => {
        if (item.id === id) {
          approvedItem = { ...item, status: 'approved' };
          return approvedItem;
        }
        return item;
      })
    );

    if (approvedItem && currentUser) {
      const newLogEntry: AuditLogEntry = {
        adminCode: currentUser.adminCode,
        action: 'approved',
        uploadId: id,
        uploadTitle: approvedItem.title,
        timestamp: new Date(),
      };
      setAuditLog(prevLog => [newLogEntry, ...prevLog]);
    }

    setAlert({ message: `Submission #${id} has been approved.`, type: 'info' });
  }, [currentUser]);

  const handleReject = useCallback((id: number) => {
    const rejectedItem = uploads.find(item => item.id === id);
    setUploads(prevUploads => prevUploads.filter(item => item.id !== id));
    
    if (rejectedItem && currentUser) {
      const newLogEntry: AuditLogEntry = {
        adminCode: currentUser.adminCode,
        action: 'rejected',
        uploadId: id,
        uploadTitle: rejectedItem.title,
        timestamp: new Date(),
      };
      setAuditLog(prevLog => [newLogEntry, ...prevLog]);
    }

    setAlert({ message: `Submission #${id} has been rejected and removed.`, type: 'info' });
  }, [uploads, currentUser]);
  
  const handleRemove = useCallback((id: number) => {
    setUploads(prevUploads => prevUploads.filter(item => item.id !== id));
    setAlert({ message: `Post #${id} has been removed.`, type: 'info' });
  }, []);

  const handleAdminLogin = useCallback((adminCode: string) => {
    const user = adminUsers.find(u => u.adminCode === adminCode);
    if (user) {
      setCurrentUser(user);
      setAlert({ message: `Welcome, Admin ${user.adminCode}!`, type: 'success' });
    } else {
      setCurrentUser(null);
      setAlert({ message: 'Incorrect admin code.', type: 'error' });
    }
  }, [adminUsers]);
  
  const handleAdminLogout = useCallback(() => {
    setCurrentUser(null);
    setImpersonatingFrom(null);
    setAlert({ message: 'You have been successfully logged out.', type: 'info' });
  }, []);

  const handleCreateAdmin = useCallback((adminCode: string) => {
    if (currentUser?.role !== 'super-admin') {
      setAlert({ message: 'You do not have permission to create admins.', type: 'error' });
      return;
    }
    if (!/^\d+$/.test(adminCode)) {
      setAlert({ message: 'Admin code must be a number.', type: 'error'});
      return;
    }
    if (adminUsers.some(u => u.adminCode === adminCode)) {
      setAlert({ message: 'Admin code already exists.', type: 'error' });
      return;
    }
    const newUser: User = { adminCode, role: 'admin' };
    setAdminUsers(prev => [...prev, newUser]);
    setAlert({ message: `Admin with code "${adminCode}" created successfully.`, type: 'success' });
  }, [currentUser, adminUsers]);

  const handleChangeAdminCode = useCallback((newCode: string) => {
    if (currentUser?.role !== 'super-admin') {
      setAlert({ message: 'Only the owner can change their admin code.', type: 'error' });
      return;
    }
    if (!/^\d+$/.test(newCode)) {
      setAlert({ message: 'New admin code must be a number.', type: 'error' });
      return;
    }
    if (adminUsers.some(u => u.adminCode === newCode && u.role !== 'super-admin')) {
      setAlert({ message: 'This admin code is already in use by another admin.', type: 'error' });
      return;
    }

    const oldCode = currentUser.adminCode;
    
    setAdminUsers(prevAdmins => 
      prevAdmins.map(user => 
        user.adminCode === oldCode && user.role === 'super-admin'
          ? { ...user, adminCode: newCode }
          : user
      )
    );
    
    setCurrentUser(prevUser => {
      if (prevUser && prevUser.adminCode === oldCode && prevUser.role === 'super-admin') {
        return { ...prevUser, adminCode: newCode };
      }
      return prevUser;
    });

    setAlert({ message: `Your admin code has been changed to "${newCode}".`, type: 'success' });
  }, [currentUser, adminUsers]);

  const handleImpersonateStart = useCallback((adminCode: string) => {
    if (currentUser?.role !== 'super-admin' || impersonatingFrom) {
        return; // Only super-admin who is not already impersonating can do this
    }
    const targetUser = adminUsers.find(u => u.adminCode === adminCode && u.role === 'admin');
    if (targetUser) {
        setImpersonatingFrom(currentUser);
        setCurrentUser(targetUser);
        setAlert({ message: `Now impersonating admin "${targetUser.adminCode}".`, type: 'info' });
    }
  }, [currentUser, adminUsers, impersonatingFrom]);

  const handleImpersonateStop = useCallback(() => {
    if (impersonatingFrom) {
        setCurrentUser(impersonatingFrom);
        setImpersonatingFrom(null);
        setAlert({ message: 'Returned to your super-admin session.', type: 'info' });
    }
  }, [impersonatingFrom]);

  const handleDeleteAdmin = useCallback((adminCode: string) => {
    if (currentUser?.role !== 'super-admin') {
      setAlert({ message: 'You do not have permission to delete admins.', type: 'error' });
      return;
    }
    const adminToDelete = adminUsers.find(u => u.adminCode === adminCode);
    if (!adminToDelete) {
      setAlert({ message: 'Admin not found.', type: 'error' });
      return;
    }
    if (adminToDelete.role === 'super-admin') {
      setAlert({ message: 'Cannot delete the super-admin account.', type: 'error' });
      return;
    }
    setAdminUsers(prevAdmins => prevAdmins.filter(user => user.adminCode !== adminCode));
    setAlert({ message: `Admin "${adminCode}" has been deleted.`, type: 'success' });
  }, [currentUser, adminUsers]);


  return (
    <div className="min-h-screen bg-gray-900 text-slate-200 font-sans relative isolate overflow-hidden">
      <BackgroundAnimation />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 tracking-tight">Secure Content Hub</h1>
          <p className="text-slate-400 mt-2 text-lg">Upload, share, and moderate community content with ease.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-white/10">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-6 sm:p-8">
            {activeTab === 'main' && <MainTab onUpload={handleUpload} setAlert={setAlert} />}
            {activeTab === 'community' && <CommunityTab uploads={uploads} currentUser={currentUser} setActiveTab={setActiveTab} onRemove={handleRemove} />}
            {activeTab === 'admin' && (
              <AdminTab
                uploads={uploads}
                onApprove={handleApprove}
                onReject={handleReject}
                currentUser={currentUser}
                onAdminLogin={handleAdminLogin}
                onAdminLogout={handleAdminLogout}
                onCreateAdmin={handleCreateAdmin}
                onChangeAdminCode={handleChangeAdminCode}
                adminUsers={adminUsers}
                auditLog={auditLog}
                impersonatingFrom={impersonatingFrom}
                onImpersonateStart={handleImpersonateStart}
                onImpersonateStop={handleImpersonateStop}
                onDeleteAdmin={handleDeleteAdmin}
              />
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-400">
          <p>&copy; {new Date().getFullYear()} Secure Content Hub. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;