# Feature Landscape

**Domain:** Viral Fortune Telling App (Japanese Market)
**Researched:** 2026-01-22
**Confidence:** MEDIUM-HIGH

## Table Stakes

Features users expect in modern fortune telling apps. Missing these makes the product feel incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Daily Fortune Delivery** | Users expect fresh content every day | Low | Push notifications at optimal times (morning commute), customizable delivery time |
| **Personalized Results** | Generic fortunes feel worthless | Medium | Birthdate-based calculations, zodiac/element integration, name input |
| **Result Saving/Sharing** | Users want to save and share their fortunes | Low | Native share sheet, save to camera roll, one-tap sharing |
| **Visual Feedback** | Text-only results feel dated | Medium | Animated reveals, typewriter effects, color-coded results (good/bad luck) |
| **Basic Video Generation** | 2026 standard for fortune apps | High | Server-side rendering, 9:16 vertical format, 15-30 second videos |
| **Social Sharing Integration** | TikTok/Instagram is where content spreads | Medium | Direct share to TikTok, Instagram Stories, LINE |
| **Offline Result Access** | Users check fortunes in subways/areas with poor connectivity | Low | AsyncStorage caching of last result |
| **Cross-Platform Sync** | Users switch between devices | Medium | Cloud storage of fortune history, account system |
| **Japanese Localization** | Target market expects native experience | Low | Proper font rendering, date formatting, cultural nuances |

**Key Insight:** Modern users (especially Gen Z) expect **video content** as default, not premium feature. Static text results feel "old-fashioned" (昭和感).

## Differentiators

Features that make content shareable and the app go viral. Not required, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **7-Second Hook Videos** | Captures attention in TikTok's critical window | High | Opening hook → Rising action → Fortune reveal → Call-to-action |
| **Emotional Resonance (共感)** | Content that feels personally relatable gets shared | Medium | "That's so me!" moments, specific life situations (job hunting, relationships) |
| **Humor Integration (笑い)** | Funny content spreads faster than serious | High | Self-deprecating fortunes, unexpected twists, playful animations |
| **Friend Comparison (相性診断)** | Social proof drives virality | Medium | Compatibility scores with friends, "Which friend is your soulmate?" format |
| **Weekly/Monthly Fortune Videos** | Creates recurring engagement | Medium | Week-ahead forecast, monthly summary, yearly fortune (年運) |
| **Personalized Video Templates** | Each user gets unique-feeling content | High | Dynamic text insertion, background music choices, avatar representation |
| **Fortune Streak Tracking** | Gamification creates habit formation | Low | "Check your fortune 7 days in a row" achievements |
| **Share Triggers** | Embedded psychological prompts to share | Medium | "Tag a friend who needs this today," "Share your luck score" |
| **Result Reveal Animation** | Creates anticipation and satisfaction | Medium | Card flip, particle effects, dramatic music swell |
| **Year-Specific Branding** | Creates urgency and relevance | Low | "Your 2026 Fortune," "What the Year of the Red Horse means for you" |

### Viral Content Patterns (HIGH CONFIDENCE - 2026 Trends)

**The 7-Second Hook Formula:**
- **0-2s:** Visual hook (bold colors, motion, curiosity: "Your luck score in 2026...")
- **2-5s:** Personalization (user's element/zodiac appears, "Wood element people listen up")
- **5-7s:** Promise (reveal teaser: "This will change your year")

**Share Triggers (Psychology):**
- **Barnum Effect:** Vague but personally applicable statements ("You're creative but sometimes doubt yourself")
- **Social Currency:** Sharing makes users look good/insightful ("I'm so self-aware")
- **Emotional Contagion:** High-arousal emotions → awe, laughter, nostalgia
- **Reciprocity:** "Tag a friend who needs to see this" drives social engagement

**Video Structure for Maximum Shareability:**
```
[Hook 0-2s] → [Personalization 2-5s] → [Fortune Reveal 5-15s] → [Call-to-Action 15-20s] → [Branding 20-30s]
```

### Japanese Market Specifics

**Cultural Resonance:**
- **陰陽五行 (Yin-Yang Five Elements):** Traditional framework feels authentic to Japanese users
- **年運 (Nen-Un):** Yearly fortunes are especially popular in Japan (New Year tradition)
- **干支 (Eto):** Year of the Red Horse (2026) creates urgency and relevance
- **Friend Compatibility:** 相性診断 is popular in Japanese apps (compare with friends,恋人)

**Language Patterns:**
- Mix of polite (desu/masu) and casual forms for authenticity
- Seasonal references (桜, 紅葉, 雪) for emotional resonance
- Emotional words that trigger sharing: 衝撃の事実, 知らずに損してる, まるで当たっている

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Long-Form Fortune Text (>500 chars)** | Users don't read, breaks video flow | Use bullet points, split into multiple screens, focus on video |
| **Generic/Boring Visuals** | Feels cheap, doesn't get shared | Invest in unique animations, color palettes, memorable characters |
| **Forced Account Creation** | Blocks first fortune, high drop-off | Allow guest access, offer account benefits after value delivered |
| **Excessive Ads in Videos** | Ruins experience, creates resentment | Subtle branding at end, no mid-roll ads under 30s |
| **Negative/Scary Fortunes** | Creates anxiety, not shareable | Frame challenges positively ("Growth opportunity" not "Bad luck") |
| **Complex Navigation** | Users want quick answers | Single-tap fortune access, minimal screens, clear CTAs |
| **Daily Login Limits** | Feels greedy, frustrates users | Unlimited free access, premium templates/features for payment |
| **Inaccurate Japanese Cultural References** | Breaks immersion, feels inauthentic | Consult native speakers, use proper terminology (陰陽道, 五行説) |
| **Non-Vertical Videos** | Doesn't fit TikTok/Instagram format | Always generate 9:16 (1080x1920 or 720x1280) |
| **Slow Generation (>30s)** | Users abandon waiting | Optimize rendering, show progress, provide estimated time |

### Design Anti-Patterns to Avoid

**The "AI Fortune Teller" Trap:**
- What goes wrong: Focusing on "AI-powered" as the main feature
- Why it's wrong: Users don't care about technology, they care about accuracy and entertainment value
- Instead: Emphasize "surprisingly accurate" and "fun to share," not AI tech

**The "Tarot Copycat" Trap:**
- What goes wrong: Copying Western tarot apps without cultural adaptation
- Why it's wrong: Japanese users expect different aesthetics and cultural references
- Instead: Use Japanese fortune telling traditions (omikuji, elemental fortunes)

**The "Feature Bloat" Trap:**
- What goes wrong: Adding chat, community, premium courses, everything
- Why it's wrong: Distracts from core value proposition, overwhelms users
- Instead: Do one thing exceptionally well (shareable fortune videos)

## Feature Dependencies

```
Core Fortune Logic
    ↓
Personalized Result Generation
    ↓
Video Generation Service
    ↓
Video Playback & Sharing
    ↓
Social Engagement (Comments, Tags)
```

**Critical Path:**
1. **Fortune Calculation Engine** → Required for all features
2. **Video Generation System** → Required for viral content
3. **Share Integration** → Required for growth loop

**Parallel Development:**
- Friend comparison can be developed alongside core features
- Gamification (streaks) can be added post-MVP
- Premium templates can wait until user base established

## MVP Recommendation

For MVP, prioritize in this order:

### Phase 1: Core Experience (Must Have)
1. **Daily fortune calculation** (陰陽五行 based on birthdate)
2. **Personalized result display** (element, zodiac, daily luck score)
3. **Basic video generation** (15-30 seconds, shareable)
4. **Native sharing** (TikTok, Instagram, LINE)

**Rationale:** These four features create the core "get fortune → watch video → share" loop.

### Phase 2: Viral Mechanics (High Impact)
1. **7-second hook implementation** (video structure optimization)
2. **Friend comparison feature** (compatibility diagnosis)
3. **Share triggers** (CTA in videos: "Tag a friend")
4. **Fortune reveal animations** (anticipation → satisfaction)

**Rationale:** These features maximize shareability and viral growth after core experience is stable.

### Phase 3: Engagement & Retention (Medium Impact)
1. **Fortune streak tracking** (gamification)
2. **Weekly/monthly fortune videos** (recurring content)
3. **Video template variety** (personalization options)
4. **Push notification optimization** (timing experiments)

**Rationale:** Engagement features can wait until user acquisition pipeline is functional.

### Defer to Post-MVP
- **Premium/subscriptions** (monetization can wait)
- **Social community features** (chat, forums - complex, different value prop)
- **Multiple fortune types** (tarot, numerology - stay focused on 陰陽五行)
- **AI chatbot integration** (nice-to-have, not core to shareable videos)

## Complexity Assessment

**Low Complexity (1-3 days):**
- Daily fortune display
- Native sharing integration
- Fortune result caching
- Basic push notifications
- Streak tracking

**Medium Complexity (1-2 weeks):**
- Video generation service integration
- Friend comparison logic
- Share trigger implementation
- Video template customization
- Cross-platform sync

**High Complexity (2-4 weeks):**
- Server-side Remotion rendering setup
- 7-second hook optimization
- Advanced animation systems
- Video rendering queue management
- Personalized template generation

## Japanese Market Success Factors

Based on 2026 trends:

1. **年運 (Yearly Fortune) Focus**
   - Japanese users especially seek yearly fortunes
   - "Your 2026 fortune" content gets higher engagement
   - Year of the Red Horse (2026) creates urgency

2. **相性診断 (Compatibility) Virality**
   - Comparing with friends is highly shareable
   - "Who's your soulmate?" format drives engagement
   - Friend tagging creates network effects

3. **Visual Quality Expectations**
   - Japanese users have high aesthetic standards
   - Cheap-looking content doesn't get shared
   - Invest in polished animations and typography

4. **Emotional Resonance (共感)**
   - Fortunes that feel personally relevant
   - Specific situations (job hunting, relationships)
   - "This is so me!" moments drive sharing

5. **Humor (笑い) Balance**
   - Not too silly (loses credibility)
   - Not too serious (boring, not shareable)
   - Self-deprecating humor works well in Japan

## Viral Content Examples

**Successful Formats (from research):**

1. **"Your 2026 Luck Score"**
   - Hook: "Your luck score is..."
   - Reveal: Dramatic number reveal
   - Share trigger: "What's your friend's score?"

2. **"Which Element Are You?"**
   - Hook: "Wood, Fire, Earth, Metal, or Water?"
   - Personalization: User's element appears
   - Share trigger: "Share with your element friends"

3. **"Friend Compatibility Battle"**
   - Hook: "Who's your most compatible friend?"
   - Reveal: Top 3 friends ranked
   - Share trigger: Tag friends to see their ranking

4. **"This Month's Warning"**
   - Hook: "Warning for [zodiac sign] this month"
   - Reveal: Surprisingly specific insight
   - Share trigger: "Tag a [zodiac] friend"

## Sources

### High Confidence (Official Documentation)
- [TikTok Storytelling: The 7-Second Hook Formula](https://purplestardust.space/the-7-second-hook-what-tiktok-teaches-brands-about-storytelling-in-2026/) - 2026 storytelling principles
- [HeyGen Fortune Telling Use Case](https://www.heygen.com/use-cases/fortune-telling) - AI video generation for fortune telling
- [Top Astrology Apps 2026](https://www.autviz.com/top-10-best-astrology-app-in-2026/) - Current market leaders feature analysis
- [Astrology Apps Market 2026-2032](https://www.360iresearch.com/library/intelligence/horoscope-astrology-apps) - Market growth projections ($2.16B, 9.28% CAGR)

### Medium Confidence (Recent Articles, Verified 2025-2026)
- [Viral Hooks That Get Attention in 7 Seconds (2026 Update)](https://blog.owodaily.com/viral-hooks-that-get-attention-in-7-seconds/) - Hook strategies for 2026
- [50+ Viral Hook Templates for Ads, Reels, TikTok (2026)](https://www.marketingblocks.ai/50-viral-hook-templates-for-ads-reels-tiktok-or-captions-2026-frameworks-examples-ai-prompts-included/) - Specific hook templates
- [Horoscope App Development Guide](https://www.jploft.com/blog/develop-a-horoscope-app-like-faladdin) - Features and gamification patterns
- [Top 7 UGC Video Generators: Boost Your Brand in 2026](https://www.empler.ai/blog/top-7-ugc-video-generators-boost-your-brand-in-2026) - UGC generation trends

### Medium-Low Confidence (Social Media Trends, Japanese Market)
- [星ひとみ監修「2026年の運勢占い」](https://www.tiktok.com/ja/trending/detail/%25E6%2598%259F%25E3%2581%25B2%25E3%2581%25A8%25E3%2581%25BF%25E7%259B%25A3%25E4%25BF%25AE%25E3%2580%258C2026%25E5%25B9%25B4%25E3%2581%25AE%25E9%2581%258B%25E5%258B%25A2%25E5%258D%25A0%25E3%2581%2584%25E3%2580%258D%25E5%2585%25AC%25E9%2596%258B) - Japanese TikTok fortune trends
- [2026 TikTok Fortune Trends](https://www.tiktok.com/@paruko_newmoon/video/7588894679442279701) - Love fortune content format
- [2026年は2016年がトレンド](https://www.ellegirl.jp/fashion/column/a70029787/20262016-sns2016/) - Japanese SNS nostalgia trends

### Low Confidence (Community Observations, Needs Validation)
- Various TikTok fortune telling content patterns observed in trending tags
- Japanese user behavior patterns on social media (needs user research validation)
- Specific emotional trigger effectiveness for Japanese users (cultural testing needed)

## Gaps & Questions

**Areas needing phase-specific research:**
1. **Exact video template designs** - What visual styles resonate with Japanese Gen Z?
2. **Optimal fortune length** - How much text is too much for 15-30s videos?
3. **Pricing strategy** - Will Japanese users pay for premium video templates?
4. **Push notification timing** - What times/days maximize engagement?
5. **Share rate benchmarks** - What's a "good" share rate for fortune content?

**Validation needed:**
- User testing of 7-second hook effectiveness with Japanese audience
- A/B testing of emotional resonance (共感) vs humor (笑い) approaches
- Competitive analysis of top Japanese fortune apps' video content

---
*Feature research for: Viral Fortune Telling App (Japanese Market)*
*Researched: 2026-01-22*
