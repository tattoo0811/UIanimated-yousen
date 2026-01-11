export interface CharacterData {
    id: number;
    name: string; // Kanshi name e.g. 甲子
    reading: string;
    character_name: string;
    concept: string;
    attributes: {
        primary: string;
        secondary: string;
    };
    features: string[];
}

// 陽占ハック：バイラルキャラクターデータ
export interface ViralCharacterData {
    id: number;
    name: string; // Kanshi name e.g. 甲子
    character_name: string; // e.g. 水辺の賢者
    core_style: {
        viral_expression: string; // バズり表現
        strengths_weaknesses: string; // 強み/弱点
    };
    social_face: {
        superior: string; // 上司（北）
        subordinate: string; // 部下（南）
    };
    private_face: {
        society: string; // 社会（東）
        family: string; // 家庭（西）
    };
}

export interface YangSen {
    head: string;
    rightHand: string;
    chest: string;
    leftHand: string;
    belly: string;
    leftShoulder: { name: string; score: number };
    rightLeg: { name: string; score: number };
    leftLeg: { name: string; score: number };
}

export interface YinSenPillar {
    stem: string;
    branch: string;
    name: string;
    hiddenStems: string[];
    tenStar?: string; // Main Stem Ten Star
    hiddenTenStar?: string; // Hidden Stem Ten Star
    twelveUn?: string; // Twelve Un
}

export interface YinSen {
    year: YinSenPillar;
    month: YinSenPillar;
    day: YinSenPillar;
    hour: YinSenPillar;
}

export interface TaiunCycle {
    startAge: number;
    endAge: number;
    stem: string;
    branch: string;
    name: string; // Kanshi name
    tenStar: string; // Day Stem vs Taiun Stem
    twelveStar: string; // Day Stem vs Taiun Branch
}

export interface Taiun {
    gender: 'male' | 'female';
    direction: 'forward' | 'backward';
    startAge: number;
    cycles: TaiunCycle[];
}

export interface EnergyInterpretation {
    level: string;
    description: string;
    advice: string;
    characteristics: string[];
}

export interface AnalysisResult {
    character: CharacterData;
    yinSen: YinSen;
    yangSen: YangSen;
    taiun: Taiun;
    energyScore: number;
    energyInterpretation: EnergyInterpretation;
    fiveElements: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
    };
    birthDate: string;
    birthTime: string;
    detailed?: DetailedAnalysisResult;
}

export interface DetailedAnalysisResult {
    meta: {
        version: string;
        generated_at: string;
    };
    basic_profile: {
        birth_datetime: string;
        gender: string;
        timezone: string;
    };
    chart: {
        yin_yang: {
            yin: number;
            yang: number;
            balance: number; // -100 (Yin) to 100 (Yang)
        };
        five_elements: {
            wood: number;
            fire: number;
            earth: number;
            metal: number;
            water: number;
            cycle_relations: {
                productive: number;
                destructive: number;
                void: number;
            };
        };
        ten_gods_strength: {
            bi_jian: number; // 比肩 (Friend)
            jie_cai: number; // 劫財 (Rob Wealth)
            shi_shen: number; // 食神 (Eating God)
            shang_guan: number; // 傷官 (Hurting Officer)
            pian_cai: number; // 偏財 (Indirect Wealth)
            zheng_cai: number; // 正財 (Direct Wealth)
            qi_sha: number; // 偏官 (Seven Killings)
            zheng_guan: number; // 正官 (Direct Officer)
            pian_yin: number; // 偏印 (Indirect Resource)
            zheng_yin: number; // 正印 (Direct Resource)
        };
        tian_gan_attributes: {
            drive: number;
            creativity: number;
            discipline: number;
            leadership: number;
            flexibility: number;
            emotional_depth: number;
            insight: number;
            resilience: number;
            warmth: number;
            logic: number;
        };
        di_zhi_animals_energy: Record<string, number>;
    };
    personality_analysis: {
        core_traits: {
            decisiveness: number;
            adaptability: number;
            sociability: number;
            creativity: number;
            logic_thinking: number;
            emotional_balance: number;
            patience: number;
            self_control: number;
            confidence: number;
            sensitivity: number;
        };
        behavior_patterns: {
            risk_taking: number;
            planning_skill: number;
            consistency: number;
            communication_style: number;
            collaboration_style: number;
            stress_coping: number;
            intuition: number;
            initiative: number;
            learning_speed: number;
            self_reflection: number;
        };
        relationship_tendencies: {
            attachment_style: number;
            empathy: number;
            compatibility_general: number;
            trust_building: number;
            conflict_reaction: number;
            boundaries: number;
            expressiveness: number;
            relationship_maintenance: number;
            attention_to_partner: number;
            patience_with_others: number;
        };
    };
    luck_cycle: {
        year_fortune: {
            overall: number;
            love: number;
            career: number;
            money: number;
            health: number;
            human_relations: number;
            growth_energy: number;
            conflict_risk: number;
            opportunity_wave: number;
            stagnation_wave: number;
        };
        month_fortune: {
            overall: number;
            love: number;
            career: number;
            money: number;
            health: number;
            human_relations: number;
            action_timing: number;
            lucky_days: string[];
            warning_days: string[];
        };
    };
    compatibility: {
        general_score: number;
        elements_balance: number;
        yin_yang_fit: number;
        communication_match: number;
        emotional_match: number;
        value_match: number;
        conflict_points: number;
        growth_synergy: number;
        long_term_stability: number;
        overall_index: number;
    };
    action_guidance: {
        monthly_focus: {
            self_growth: number;
            relationships: number;
            career: number;
            money: number;
            health: number;
            creativity: number;
            discipline: number;
            rest_recovery: number;
            communication: number;
            challenge: number;
        };
        daily_keywords: string[];
    };
    tags: {
        personality_tags: string[];
        growth_tags: string[];
        warning_tags: string[];
        lucky_tags: string[];
        relationship_tags: string[];
    };
}
