'use client';

import { motion } from 'framer-motion';

interface FiveElementsChartProps {
    data: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
}

export default function FiveElementsChart({ data }: FiveElementsChartProps) {
    // Max value for scaling
    const maxVal = Math.max(data.wood, data.fire, data.earth, data.metal, data.water, 5);
    const scale = (val: number) => (val / maxVal) * 80; // 80 is radius

    // Vertices for Pentagon (Radius 100, Center 100,100)
    // 0 deg is Top (Fire)
    // 72 deg is Earth
    // 144 deg is Metal
    // 216 deg is Water
    // 288 deg is Wood

    const getPoint = (val: number, angleDeg: number) => {
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        const r = scale(val);
        return `${100 + r * Math.cos(angleRad)},${100 + r * Math.sin(angleRad)}`;
    };

    const points = [
        getPoint(data.fire, 0),    // Fire
        getPoint(data.earth, 72),  // Earth
        getPoint(data.metal, 144), // Metal
        getPoint(data.water, 216), // Water
        getPoint(data.wood, 288),  // Wood
    ].join(' ');

    const axisPoints = [
        getPoint(maxVal, 0),
        getPoint(maxVal, 72),
        getPoint(maxVal, 144),
        getPoint(maxVal, 216),
        getPoint(maxVal, 288),
    ];

    return (
        <div className="relative w-64 h-64 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                {/* Background Pentagon */}
                <polygon points={axisPoints.map((_, i) => getPoint(maxVal, i * 72)).join(' ')} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                <polygon points={axisPoints.map((_, i) => getPoint(maxVal * 0.5, i * 72)).join(' ')} fill="none" stroke="rgba(255,255,255,0.05)" />

                {/* Axes */}
                {axisPoints.map((p, i) => (
                    <line key={i} x1="100" y1="100" x2={p.split(',')[0]} y2={p.split(',')[1]} stroke="rgba(255,255,255,0.1)" />
                ))}

                {/* Data Shape */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    points={points}
                    fill="rgba(212, 175, 55, 0.5)"
                    stroke="#D4AF37"
                    strokeWidth="2"
                />

                {/* Labels */}
                <text x="100" y="10" textAnchor="middle" fill="#FF4444" fontSize="12">火 (Fire)</text>
                <text x="190" y="80" textAnchor="middle" fill="#D4AF37" fontSize="12">土 (Earth)</text>
                <text x="160" y="190" textAnchor="middle" fill="#C0C0C0" fontSize="12">金 (Metal)</text>
                <text x="40" y="190" textAnchor="middle" fill="#4444FF" fontSize="12">水 (Water)</text>
                <text x="10" y="80" textAnchor="middle" fill="#44FF44" fontSize="12">木 (Wood)</text>
            </svg>
        </div>
    );
}
