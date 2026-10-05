import React from 'react';
import { ApplicationStatus, STATUS_LABELS } from '@/types/digitalSeva';
import {
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Cog,
  AlertTriangle,
  Award,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  showGujarati?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showGujarati = true,
  size = 'md',
}) => {
  const meta = STATUS_LABELS[status as ApplicationStatus] || {
    en: status,
    gu: status,
    color: 'text-slate-400',
    bg: 'bg-slate-800',
    border: 'border-slate-700',
  };

  const getIcon = () => {
    switch (status) {
      case 'Application Received':
        return <FileText className="w-3.5 h-3.5" />;
      case 'Payment Pending':
        return <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />;
      case 'Payment Received':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Document Checking':
        return <Search className="w-3.5 h-3.5 text-purple-400" />;
      case 'Processing':
        return <Cog className="w-3.5 h-3.5 text-cyan-400 animate-spin" />;
      case 'Correction Required':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'Completed':
        return <Award className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Rejected / Cancelled':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${meta.bg} ${meta.color} ${meta.border} ${sizeClasses}`}
    >
      {getIcon()}
      <span>{meta.en}</span>
      {showGujarati && meta.gu && (
        <span className="opacity-80 text-[10px]">({meta.gu})</span>
      )}
    </span>
  );
};
