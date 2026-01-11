'use client';
import { YinSen } from '@/types';

export default function YinSenChart({ data }: { data: YinSen }) {
    // Columns: Item, Day, Month, Year (removed Hour pillar per user request)
    const pillars = [
        { key: 'day', label: '日柱', data: data.day },
        { key: 'month', label: '月柱', data: data.month },
        { key: 'year', label: '年柱', data: data.year },
    ];

    const rows = [
        { label: '天干', key: 'stem' },
        { label: '地支', key: 'branch' },
        { label: '蔵干', key: 'hiddenStems', render: (d: any) => d.hiddenStems[0] || '-' },
        { label: '通変星', key: 'tenStar' },
        { label: '蔵干通変星', key: 'hiddenTenStar' },
        { label: '十二運', key: 'twelveUn' },
    ];

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-center border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="p-2 text-gold font-serif border-b border-white/10 text-left">項目</th>
                        {pillars.map((p) => (
                            <th key={p.key} className="p-2 text-gold font-serif border-b border-white/10">
                                {p.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.label} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-3 text-gray-400 font-serif text-left whitespace-nowrap">{row.label}</td>
                            {pillars.map((p) => {
                                const val = p.data[row.key as keyof typeof p.data];
                                const displayVal = row.render ? row.render(p.data) : val;

                                // Styling based on row type
                                const isMain = row.key === 'stem' || row.key === 'branch';
                                const isStar = row.key === 'tenStar' || row.key === 'hiddenTenStar';

                                return (
                                    <td key={`${p.key}-${row.key}`} className={`p-3 font-serif ${isMain ? 'text-xl text-white' : isStar ? 'text-gold/80' : 'text-gray-300'}`}>
                                        {Array.isArray(displayVal) ? displayVal.join(',') : displayVal}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
