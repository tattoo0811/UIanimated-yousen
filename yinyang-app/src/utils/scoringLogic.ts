
import { YangSen, YinSen, DetailedAnalysisResult } from '@/types';
import { STEMS, BRANCHES, FourPillars } from './logic';

// Helper to normalize scores to 0-100
const normalize = (val: number, max: number = 10) => Math.min(100, Math.max(0, Math.round((val / max) * 100)));

export function calculateDetailedScores(
    bazi: FourPillars,
    fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number },
    yangSen: YangSen,
    gender: string,
    birthDate: Date
): DetailedAnalysisResult {

    // 1. Yin Yang Balance
    // Count Yin/Yang stems and branches
    // Yang Stems: 甲, 丙, 戊, 庚, 壬 (Indices 0, 2, 4, 6, 8)
    // Yin Stems: 乙, 丁, 己, 辛, 癸 (Indices 1, 3, 5, 7, 9)
    // Yang Branches: 子, 寅, 辰, 午, 申, 戌 (Indices 0, 2, 4, 6, 8, 10) - Note: Rat(子) is Yang in Sanmei? Usually Rat is Yang water but Yin branch physically? 
    // Sanmei Standard: 
    // Yang: 子, 寅, 辰, 午, 申, 戌
    // Yin: 丑, 卯, 巳, 未, 酉, 亥

    let yangCount = 0;
    let yinCount = 0;

    const checkYinYang = (idx: number) => {
        if (idx % 2 === 0) yangCount++;
        else yinCount++;
    };

    [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem].forEach(s => checkYinYang(s - 1));
    [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch].forEach(b => checkYinYang(b - 1));

    const total = yangCount + yinCount;
    const yinScore = (yinCount / total) * 100;
    const yangScore = (yangCount / total) * 100;
    const balance = yangScore - yinScore; // Positive = Yang heavy, Negative = Yin heavy

    // 2. Ten Gods Strength (Mapping from YangSen & YinSen)
    // We count occurrences in YangSen (5 stars) + YinSen (Hidden Stems)
    // Simple heuristic: 
    // YangSen stars = 20 points each
    // YinSen main hidden stems = 10 points each

    const tenGods = {
        bi_jian: 0, jie_cai: 0, shi_shen: 0, shang_guan: 0,
        pian_cai: 0, zheng_cai: 0, qi_sha: 0, zheng_guan: 0,
        pian_yin: 0, zheng_yin: 0
    };

    const starMap: Record<string, keyof typeof tenGods> = {
        '貫索星': 'bi_jian',
        '石門星': 'jie_cai',
        '鳳閣星': 'shi_shen',
        '調舒星': 'shang_guan',
        '禄存星': 'pian_cai',
        '司禄星': 'zheng_cai',
        '車騎星': 'qi_sha',
        '牽牛星': 'zheng_guan',
        '龍高星': 'pian_yin',
        '玉堂星': 'zheng_yin'
    };

    // Add from YangSen (The 5 main stars)
    [yangSen.head, yangSen.rightHand, yangSen.chest, yangSen.leftHand, yangSen.belly].forEach(star => {
        if (starMap[star]) tenGods[starMap[star]] += 20;
    });

    // Normalize Ten Gods (Max possible is 100 if all 5 are same, which is rare but possible)
    // We can leave them as is or cap at 100.

    // 3. Personality Analysis (Derived from Elements & Gods)
    // Wood: Creativity, Empathy
    // Fire: Sociability, Expressiveness
    // Earth: Trust, Patience
    // Metal: Decisiveness, Discipline
    // Water: Logic, Adaptability

    const totalElement = fiveElements.wood + fiveElements.fire + fiveElements.earth + fiveElements.metal + fiveElements.water;
    const ePct = (val: number) => (val / totalElement) * 100;

    const core_traits = {
        decisiveness: normalize(ePct(fiveElements.metal) + tenGods.qi_sha + tenGods.zheng_guan, 100),
        adaptability: normalize(ePct(fiveElements.water) + tenGods.pian_cai + tenGods.jie_cai, 100),
        sociability: normalize(ePct(fiveElements.fire) + tenGods.shi_shen + tenGods.pian_cai, 100),
        creativity: normalize(ePct(fiveElements.wood) + tenGods.shang_guan + tenGods.pian_yin, 100),
        logic_thinking: normalize(ePct(fiveElements.water) + tenGods.zheng_yin + tenGods.pian_yin, 100),
        emotional_balance: normalize(ePct(fiveElements.earth) + tenGods.shi_shen + tenGods.zheng_cai, 100),
        patience: normalize(ePct(fiveElements.earth) + tenGods.bi_jian + tenGods.zheng_guan, 100),
        self_control: normalize(ePct(fiveElements.metal) + tenGods.zheng_guan + tenGods.zheng_cai, 100),
        confidence: normalize(ePct(fiveElements.fire) + tenGods.bi_jian + tenGods.qi_sha, 100),
        sensitivity: normalize(ePct(fiveElements.water) + tenGods.shang_guan + tenGods.pian_yin, 100)
    };

    // 4. Luck Cycle (Placeholder logic for now)
    // Real logic would require calculating the current Year/Month GanZhi and their interaction with the chart.
    // For now, we return neutral/randomized structure or static values to be filled by AI later?
    // Better to calculate simple interaction (e.g. Element matching).

    // Simple Year Fortune (based on current year 2025 - 乙巳 Wood Snake)
    // If User needs Wood/Fire -> Good. If User fears Wood/Fire -> Bad.
    // This requires "Yong Shen" (Useful God) calculation which is complex.
    // We will set baseline values.

    return {
        meta: {
            version: "1.0",
            generated_at: new Date().toISOString()
        },
        basic_profile: {
            birth_datetime: birthDate.toISOString(),
            gender: gender,
            timezone: "Asia/Tokyo"
        },
        chart: {
            yin_yang: {
                yin: Math.round(yinScore),
                yang: Math.round(yangScore),
                balance: Math.round(balance)
            },
            five_elements: {
                wood: fiveElements.wood,
                fire: fiveElements.fire,
                earth: fiveElements.earth,
                metal: fiveElements.metal,
                water: fiveElements.water,
                cycle_relations: {
                    productive: 50, // Placeholder
                    destructive: 50, // Placeholder
                    void: 0 // Placeholder
                }
            },
            ten_gods_strength: tenGods,
            tian_gan_attributes: {
                drive: core_traits.decisiveness,
                creativity: core_traits.creativity,
                discipline: core_traits.self_control,
                leadership: core_traits.confidence,
                flexibility: core_traits.adaptability,
                emotional_depth: core_traits.sensitivity,
                insight: core_traits.logic_thinking,
                resilience: core_traits.patience,
                warmth: core_traits.sociability,
                logic: core_traits.logic_thinking
            },
            di_zhi_animals_energy: {} // Populate if needed
        },
        personality_analysis: {
            core_traits,
            behavior_patterns: {
                risk_taking: normalize(tenGods.qi_sha + tenGods.pian_cai, 50),
                planning_skill: normalize(tenGods.zheng_yin + tenGods.zheng_guan, 50),
                consistency: normalize(tenGods.zheng_cai + tenGods.bi_jian, 50),
                communication_style: normalize(tenGods.shi_shen + tenGods.shang_guan, 50),
                collaboration_style: normalize(tenGods.jie_cai + tenGods.shi_shen, 50),
                stress_coping: normalize(tenGods.bi_jian + tenGods.zheng_yin, 50),
                intuition: normalize(tenGods.pian_yin + tenGods.shang_guan, 50),
                initiative: normalize(tenGods.qi_sha + tenGods.jie_cai, 50),
                learning_speed: normalize(tenGods.pian_yin + tenGods.pian_yin || 0, 50), // long_gao is pian_yin
                self_reflection: normalize(tenGods.shang_guan + tenGods.bi_jian, 50)
            },
            relationship_tendencies: {
                attachment_style: normalize(tenGods.zheng_cai + tenGods.zheng_guan, 50),
                empathy: normalize(tenGods.shi_shen + tenGods.zheng_yin, 50),
                compatibility_general: 50,
                trust_building: normalize(tenGods.zheng_cai + tenGods.zheng_guan, 50),
                conflict_reaction: normalize(tenGods.qi_sha + tenGods.shang_guan, 50),
                boundaries: normalize(tenGods.bi_jian + tenGods.qi_sha, 50),
                expressiveness: normalize(tenGods.shi_shen + tenGods.shang_guan, 50),
                relationship_maintenance: normalize(tenGods.zheng_cai + tenGods.zheng_yin, 50),
                attention_to_partner: normalize(tenGods.zheng_cai + tenGods.shi_shen, 50),
                patience_with_others: normalize(tenGods.zheng_guan + tenGods.zheng_yin, 50)
            }
        },
        luck_cycle: {
            year_fortune: {
                overall: 60,
                love: 60,
                career: 60,
                money: 60,
                health: 60,
                human_relations: 60,
                growth_energy: 60,
                conflict_risk: 40,
                opportunity_wave: 60,
                stagnation_wave: 40
            },
            month_fortune: {
                overall: 60,
                love: 60,
                career: 60,
                money: 60,
                health: 60,
                human_relations: 60,
                action_timing: 60,
                lucky_days: [],
                warning_days: []
            }
        },
        compatibility: {
            general_score: 0,
            elements_balance: 0,
            yin_yang_fit: 0,
            communication_match: 0,
            emotional_match: 0,
            value_match: 0,
            conflict_points: 0,
            growth_synergy: 0,
            long_term_stability: 0,
            overall_index: 0
        },
        action_guidance: {
            monthly_focus: {
                self_growth: 70,
                relationships: 60,
                career: 65,
                money: 50,
                health: 80,
                creativity: 55,
                discipline: 60,
                rest_recovery: 40,
                communication: 75,
                challenge: 60
            },
            daily_keywords: []
        },
        tags: {
            personality_tags: [],
            growth_tags: [],
            warning_tags: [],
            lucky_tags: [],
            relationship_tags: []
        }
    };
}
