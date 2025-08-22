
import React, { useState, useEffect, useCallback } from 'react';
import { Tab, UploadItem, AlertMessage, User, AuditLogEntry, UserRole, ChatMessage } from './types';
import MainTab from './components/MainTab';
import CommunityTab from './components/CommunityTab';
import AdminTab from './components/AdminTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';
import Tabs from './components/Tabs';
import Alert from './components/Alert';

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;

    const data = JSON.parse(item);
    
    if ((key === 'auditLog' || key === 'chatMessages') && Array.isArray(data)) {
      return data.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      })) as T;
    }
    
    return data;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const getInitialUser = (): User | null => {
    try {
        const localUserItem = localStorage.getItem('currentUser');
        if (localUserItem) return JSON.parse(localUserItem);
        
        const sessionUserItem = sessionStorage.getItem('currentUser');
        if (sessionUserItem) return JSON.parse(sessionUserItem);

        return null;
    } catch (error) {
        console.warn(`Error reading user from storage:`, error);
        return null;
    }
};


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
  const [uploads, setUploads] = useState<UploadItem[]>(() => getFromLocalStorage('uploads', []));
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  
  const [users, setUsers] = useState<User[]>(() => getFromLocalStorage('users', [
    { id: 1, username: 'urwrldryan', password: 'BigBooger', role: 'owner' },
    { id: 2, username: 'sample_user', password: 'password', role: 'user' },
  ]));
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialUser());
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => getFromLocalStorage('auditLog', []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getFromLocalStorage('chatMessages', []));

  useEffect(() => { localStorage.setItem('uploads', JSON.stringify(uploads)); }, [uploads]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('auditLog', JSON.stringify(auditLog)); }, [auditLog]);
  useEffect(() => { localStorage.setItem('chatMessages', JSON.stringify(chatMessages)); }, [chatMessages]);

  useEffect(() => {
    if (currentUser) {
        const remember = localStorage.getItem('rememberUser') === 'true';
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            sessionStorage.removeItem('currentUser');
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.removeItem('currentUser');
        }
    } else {
        // On logout
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatMessages' && e.newValue) {
        setChatMessages(getFromLocalStorage('chatMessages', []));
      }
      if (e.key === 'uploads' && e.newValue) {
        setUploads(getFromLocalStorage('uploads', []));
      }
      if (e.key === 'users' && e.newValue) {
        setUsers(getFromLocalStorage('users', []));
      }
      if (e.key === 'auditLog' && e.newValue) {
        setAuditLog(getFromLocalStorage('auditLog', []));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleUpload = useCallback((url: string) => {
    if (!currentUser) {
        setAlert({ message: 'You must be logged in to submit a link.', type: 'error' });
        return;
    }
    const newUpload: UploadItem = {
      id: Date.now(),
      title: url.replace(/^https?:\/\//, '').split('/')[0] || url,
      url: url,
      status: 'pending',
      description: 'A new user submission.',
      submittedBy: currentUser.username
    };
    setUploads(prev => [newUpload, ...prev]);
    setAlert({ message: 'Upload successful! Your submission is pending approval.', type: 'success' });
    setActiveTab('community');
  }, [currentUser]);

  const handleApprove = useCallback((id: number) => {
    if (!currentUser || !['admin', 'co-owner', 'owner'].includes(currentUser.role)) return;
    let approvedItem: UploadItem | undefined;
    setUploads(prev =>
      prev.map(item => {
        if (item.id === id) {
          approvedItem = { ...item, status: 'approved' };
          return approvedItem;
        }
        return item;
      })
    );
    if (approvedItem) {
      setAuditLog(prev => [{ adminUsername: currentUser.username, action: 'approved', uploadId: id, uploadTitle: approvedItem!.title, timestamp: new Date() }, ...prev]);
    }
    setAlert({ message: `Submission #${id} has been approved.`, type: 'info' });
  }, [currentUser]);

  const handleReject = useCallback((id: number) => {
    if (!currentUser || !['admin', 'co-owner', 'owner'].includes(currentUser.role)) return;
    const rejectedItem = uploads.find(item => item.id === id);
    setUploads(prev => prev.filter(item => item.id !== id));
    if (rejectedItem) {
      setAuditLog(prev => [{ adminUsername: currentUser.username, action: 'rejected', uploadId: id, uploadTitle: rejectedItem.title, timestamp: new Date() }, ...prev]);
    }
    setAlert({ message: `Submission #${id} has been rejected and removed.`, type: 'info' });
  }, [uploads, currentUser]);
  
  const handleRemove = useCallback((id: number) => {
    if (!currentUser || !['admin', 'co-owner', 'owner'].includes(currentUser.role)) return;
    setUploads(prev => prev.filter(item => item.id !== id));
    setAlert({ message: `Post #${id} has been removed.`, type: 'info' });
  }, [currentUser]);

  const handleRegister = useCallback((username: string, password: string) => {
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          setAlert({ message: 'Username already exists.', type: 'error' });
          return;
      }
      const newUser: User = { id: Date.now(), username, password, role: 'user' };
      setUsers(prev => [...prev, newUser]);
      // Log in the new user automatically, but don't "remember" them by default.
      localStorage.removeItem('rememberUser');
      setCurrentUser(newUser);
      setAlert({ message: `Welcome, ${username}! Your account has been created.`, type: 'success' });
  }, [users]);
  
  const handleLogin = useCallback((username: string, password: string, rememberMe: boolean) => {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (user) {
          if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
          } else {
            localStorage.removeItem('rememberUser');
          }
          setCurrentUser(user);
          setAlert({ message: `Welcome back, ${user.username}!`, type: 'success' });
      } else {
          setAlert({ message: 'Invalid username or password.', type: 'error' });
      }
  }, [users]);
  
  const handleLogout = useCallback(() => {
      setCurrentUser(null);
      setActiveTab('main');
      setAlert({ message: 'You have been logged out.', type: 'info' });
  }, []);
  
  const handleSendMessage = useCallback((text: string) => {
      if (!currentUser) return;
      const newMessage: ChatMessage = { id: Date.now(), username: currentUser.username, text, timestamp: new Date() };
      const updatedMessages = [...chatMessages, newMessage];
      setChatMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  }, [currentUser, chatMessages]);

  const handleChangeUsername = useCallback((newUsername: string) => {
    if (!currentUser) return;
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== currentUser.id)) {
        setAlert({ message: 'This username is already taken.', type: 'error' });
        return false;
    }
    const oldUsername = currentUser.username;
    
    // Update user in users list
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, username: newUsername } : u));
    
    // Update currentUser state
    setCurrentUser(prev => prev ? { ...prev, username: newUsername } : null);

    // Update username in other parts of the app state
    setUploads(prev => prev.map(u => u.submittedBy === oldUsername ? { ...u, submittedBy: newUsername } : u));
    setChatMessages(prev => prev.map(m => m.username === oldUsername ? { ...m, username: newUsername } : m));
    setAuditLog(prev => prev.map(l => l.adminUsername === oldUsername ? { ...l, adminUsername: newUsername } : l));

    setAlert({ message: `Your username has been updated to ${newUsername}.`, type: 'success' });
    return true;
  }, [currentUser, users]);

  const handleChangePassword = useCallback((newPassword: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u));
    setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    setAlert({ message: 'Your password has been changed successfully.', type: 'success' });
    return true;
  }, [currentUser]);

  const handleUpdateUserRole = useCallback((userId: number, newRole: UserRole) => {
    if (currentUser?.role !== 'owner') {
        setAlert({ message: 'Only the owner can change user roles.', type: 'error' });
        return;
    }
    if (currentUser.id === userId) {
        setAlert({ message: 'You cannot change your own role.', type: 'error' });
        return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setAlert({ message: 'User role has been updated.', type: 'success' });
  }, [currentUser]);

  const handleDeleteUser = useCallback((userId: number) => {
      if (!currentUser || !['owner', 'co-owner'].includes(currentUser.role)) {
          setAlert({ message: 'You do not have permission to delete users.', type: 'error' });
          return;
      }
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) return;

      if (userToDelete.role === 'owner') {
          setAlert({ message: 'Cannot delete an owner account.', type: 'error' });
          return;
      }
      if (currentUser.role === 'co-owner' && userToDelete.role === 'co-owner') {
          setAlert({ message: 'Co-owners cannot delete other co-owners.', type: 'error' });
          return;
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      setAlert({ message: `User "${userToDelete.username}" has been deleted.`, type: 'success' });

  }, [currentUser, users]);

  return (
    <div className="min-h-screen bg-gray-900 text-slate-200 font-sans relative isolate overflow-hidden">
      <BackgroundAnimation />
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 tracking-tight">mvisd link finders</h1>
          <p className="text-slate-400 mt-2 text-lg">Upload, share, and moderate community content with ease.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-white/10">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
          <div className="p-6 sm:p-8">
            {activeTab === 'main' && <MainTab currentUser={currentUser} onRegister={handleRegister} onLogin={handleLogin} onUpload={handleUpload} setAlert={setAlert} />}
            {activeTab === 'community' && <CommunityTab uploads={uploads} currentUser={currentUser} setActiveTab={setActiveTab} onRemove={handleRemove} />}
            {activeTab === 'chat' && currentUser && <ChatTab messages={chatMessages} currentUser={currentUser} onSendMessage={handleSendMessage} setActiveTab={setActiveTab} />}
            {activeTab === 'profile' && currentUser && <ProfileTab currentUser={currentUser} onLogout={handleLogout} onChangeUsername={handleChangeUsername} onChangePassword={handleChangePassword} setAlert={setAlert} />}
            {activeTab === 'admin' && <AdminTab uploads={uploads} onApprove={handleApprove} onReject={handleReject} currentUser={currentUser} allUsers={users} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} auditLog={auditLog} />}
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-400">
          <p>&copy; {new Date().getFullYear()} mvisd link finders. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
