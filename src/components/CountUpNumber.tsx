'use client';

import { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CountUpNumberProps {
    value: number;
    duration?: number;
    className?: string;
    decimals?: number;
}

export function CountUpNumber({ 
    value, 
    duration = 1.5,
    className = '',
    decimals = 0 
}: CountUpNumberProps) {
    const count = useMotionValue(0);
    const spring = useSpring(count, {
        damping: 30,
        stiffness: 100,
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    useMotionValueEvent(spring, 'change', (latest) => {
        setDisplayValue(latest);
    });

    const formattedValue = decimals > 0 
        ? displayValue.toFixed(decimals) 
        : Math.floor(displayValue);

    return (
        <span className={className}>
            {formattedValue}
        </span>
    );
}
