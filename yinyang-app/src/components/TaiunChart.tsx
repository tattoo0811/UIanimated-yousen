import { Taiun } from '@/types';

interface TaiunChartProps {
    data: Taiun;
}

export default function TaiunChart({ data }: TaiunChartProps) {
    return (
        <div className="w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-sm text-gray-400">
                    <span className="text-gold font-bold">{data.startAge}歳運</span>
                    <span className="mx-2">|</span>
                    <span>{data.direction === 'forward' ? '順行' : '逆行'}</span>
                </div>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-white/5">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">年齢</th>
                        <th className="px-4 py-3">干支</th>
                        <th className="px-4 py-3">十大主星</th>
                        <th className="px-4 py-3 rounded-r-lg">十二大従星</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.cycles.map((cycle, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-gray-300 font-mono">
                                {cycle.startAge} - {cycle.endAge}
                            </td>
                            <td className="px-4 py-3 text-gold font-bold">
                                {cycle.name}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                                {cycle.tenStar}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                                {cycle.twelveStar}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
