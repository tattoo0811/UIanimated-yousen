'use client';

import { YangSen } from '@/types';

const Cell = ({ label, value, sub, className }: { label?: string, value?: string, sub?: string, className?: string }) => (
    <div className={`aspect-square flex flex-col items-center justify-center border border-white/5 p-1 relative ${className || ''}`}>
        {label && <span className="absolute top-1 left-1 text-[8px] text-gray-500">{label}</span>}
        {value && <span className="text-sm md:text-base font-bold text-white">{value}</span>}
        {sub && <span className="text-[10px] text-gold mt-1">{sub}</span>}
    </div>
);

export default function YangSenChart({ data }: { data: YangSen }) {
    // Grid Layout: 3x3
    // [LeftShoulder] [Head]      [Empty]
    // [RightHand]    [Chest]     [LeftHand]
    // [RightLeg]     [Belly]     [LeftLeg]

    // Note: Directions in Sanmei Gaku are often reversed (Left is Right on paper), but let's stick to the naming.
    // Usually:
    // North (Head)
    // South (Belly)
    // East (Left Hand - usually represents Mother/Siblings/Social)
    // West (Right Hand - usually represents Spouse/Family/Private)
    // Center (Chest)

    // Lifecycle:
    // Year Branch (Initial) -> Left Shoulder (Top Left)
    // Month Branch (Middle) -> Right Leg (Bottom Right)? Or Bottom Left?
    // Day Branch (Late) -> Left Leg (Bottom Left)?

    // Let's use a standard 3x3 grid for layout.

    return (
        <div className="w-full max-w-[300px] mx-auto aspect-square grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
            {/* Row 1 */}
            <Cell /> {/* Empty Top Left */}
            <Cell label="頭 (北)" value={data.head} />
            <Cell label="初年期" value={data.leftShoulder.name} sub={`${data.leftShoulder.score}点`} />

            {/* Row 2 */}
            <Cell label="右手 (西)" value={data.rightHand} />
            <Cell label="胸 (中央)" value={data.chest} className="bg-white/10" />
            <Cell label="左手 (東)" value={data.leftHand} />

            {/* Row 3 */}
            <Cell label="晩年期" value={data.rightLeg.name} sub={`${data.rightLeg.score}点`} />
            <Cell label="腹 (南)" value={data.belly} />
            <Cell label="中年期" value={data.leftLeg.name} sub={`${data.leftLeg.score}点`} />
        </div>
    );
}
