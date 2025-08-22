
export type UploadStatus = 'pending' | 'approved' | 'rejected';

export interface UploadItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  status: UploadStatus;
}

export type Tab = 'main' | 'community' | 'admin';

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
    message: string;
    type: AlertType;
}

export type UserRole = 'super-admin' | 'admin';

export interface User {
  adminCode: string;
  role: UserRole;
}

export interface AuditLogEntry {
  adminCode: string;
  action: 'approved' | 'rejected';
  uploadId: number;
  uploadTitle: string;
  timestamp: Date;
}
