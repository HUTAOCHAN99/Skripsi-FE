import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold mt-2 text-slate-900">{value}</p>
        </div>

        <div className={`${color} p-3 rounded-full text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}