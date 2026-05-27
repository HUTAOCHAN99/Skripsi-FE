'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', pengajuan: 12, approved: 8 },
  { name: 'Feb', pengajuan: 19, approved: 14 },
  { name: 'Mar', pengajuan: 15, approved: 12 },
  { name: 'Apr', pengajuan: 22, approved: 18 },
  { name: 'Mei', pengajuan: 28, approved: 24 },
  { name: 'Jun', pengajuan: 25, approved: 20 },
];

export default function Chart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="pengajuan" stroke="#3B82F6" name="Pengajuan" strokeWidth={2} />
        <Line type="monotone" dataKey="approved" stroke="#10B981" name="Approved" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}