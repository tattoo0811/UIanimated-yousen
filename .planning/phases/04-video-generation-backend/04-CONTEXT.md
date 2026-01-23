# Phase 4: Video Generation Backend Context

**Phase:** 04-video-generation-backend
**Created:** 2026-01-23
**Status:** Ready for Research

---

## Overview

サーバーサイドRemotionによる動画生成基盤を構築する。Google Cloud Platformを活用し、9:16縦動画（15-30秒）を生成するインフラとテンプレートシステムを実装する。

---

## Deployment Architecture

### Platform
- **Cloud Provider:** Google Cloud Platform
- **Compute:** Cloud Run (containerized)
- **Build:** Cloud Build
- **Trigger:** Request-triggered build (都度ビルド)

### Decision Rationale
AWSではなくGCPを選択:
- プロジェクトの既存インフラとの統合
- Cloud Runのスケーラビリティ
- Cloud Buildとの連携の容易さ

---

## Video Format Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Aspect Ratio | 9:16 (Vertical) | TikTok/Instagram Reels対応 |
| Resolution | 1080x1920 | Full HD vertical |
| Frame Rate | 30fps | Standard social media |
| Duration | 30秒 max | 7秒フック構成対応 |
| Encoding | H.264 + AAC | Standard compatibility |
| Bitrate | Variable (VBR) | Quality optimization |

---

## Progress Management

### Tracking Method
- **Approach:** Polling (ポーリング)
- **Interval:** 3-5秒
- **Error Handling:** Retry + Timeout
- **Timeout:** 30秒

### API Flow
1. Mobile app requests video generation
2. Server triggers Cloud Build job
3. Returns job_id immediately
4. Mobile app polls status endpoint every 3-5 seconds
5. Server returns: pending/processing/completed/failed
6. On completed: returns video URL
7. On timeout (30s): returns error

---

## Template Structure

### Hook Composition (7秒フック)

| Time | Section | Content |
|------|---------|---------|
| 0-2s | Visual Hook | Attention-grabbing visuals |
| 2-5s | Personalization | User nickname display |
| 5-15s | Revelation | Fortune telling results |
| 15-20s | CTA | Call-to-action |
| 20-30s | Branding | Brand elements |

### Template Strategy
- **Multiple Patterns:** テーマ別に複数のフック構成パターンを用意
- **UI Theme Integration:** KiraPop, MonoEdge, ZenWaのUIテーマに対応した動画テンプレート
- **Tone Support:** TikTok風/YouTube風/Instagram風のトーンに対応（Phase 8）

### Typing Effect
- **Implementation:** Remotion Native
- **Method:** Sequence + interpolate() で1文字ずつ表示
- **Fallback:** テーマに応じたアニメーション速度

### Nickname Insertion
- **Method:** Remotion Props
- **Flow:** InputProps → Template component → Dynamic text rendering
- **Validation:** Length check + character validation

---

## Technical Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express (API endpoints)
- **Video Engine:** Remotion
- **Container:** Docker

### Google Cloud Services
| Service | Purpose |
|---------|---------|
| Cloud Run | Container hosting |
| Cloud Build | Video rendering jobs |
| Cloud Storage | Video output storage |
| Cloud Tasks | Job queue (optional) |

---

## API Endpoints (Draft)

```
POST /api/video/generate
Body: { nickname, fortuneData, theme, tone }
Response: { jobId, status: "pending" }

GET /api/video/status/:jobId
Response: { status: "pending"|"processing"|"completed"|"failed", videoUrl? }

GET /api/video/:videoId
Response: Video file stream or redirect
```

---

## Open Questions for Research

1. **Cloud Run Memory/CPU:** Remotion渲染に必要な最小リソース
2. **Cold Start対策:** Cloud Runのコールドスタートが動画生成時間に与える影響
3. **並列処理:** 同時に複数の動画生成リクエストが来た場合のキューイング戦略
4. **ストレージ戦:** 生成動画の保存期間と配信方法
5. **コスト最適化:** Cloud Build vs Cloud Runでのレンダリング比較

---

## Next Steps

1. **Research Phase:** `/gsd:research-phase 4`
   - Remotionのベストプラクティス
   - GCP構成のリファレンスアーキテクチャ
   - 同様のシステムの事例調査

2. **Planning Phase:** `/gsd:plan-phase 4`
   - 04-01: Remotionバックエンドのセットアップ
   - 04-02: 動画テンプレートの作成
   - 04-03: 7秒フック構成とタイピングエフェクト
   - 04-04: 生成APIと進捗ポーリング

---

*Context captured: 2026-01-23*
*Workflow: /gsd:discuss-phase 4*
