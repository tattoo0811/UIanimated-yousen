-- ============================================================================
-- キャラクター算命学データベーススキーマ
-- ============================================================================
-- Turso (SQLite) ベースの設計
-- バージョン: 1.0
-- 作成日: 2026-02-10
-- ============================================================================

-- ============================================================================
-- 1. characters テーブル - キャラクター基本情報
-- ============================================================================
CREATE TABLE characters (
    character_id TEXT PRIMARY KEY,         -- キャラクターID (C001, C002, ...)
    name TEXT NOT NULL,                    -- キャラクター名
    name_kana TEXT,                        -- よみがな
    nickname TEXT,                         -- ニックネーム
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')), -- 性別
    birth_id TEXT NOT NULL UNIQUE,         -- 出生データID (外部キー)
    avatar_url TEXT,                       -- アバター画像URL
    description TEXT,                      -- キャラクター説明
    personality TEXT,                      -- 性格特徴
    background TEXT,                       -- 背景ストーリー
    created_at TEXT NOT NULL DEFAULT (datetime('now')), -- 作成日時
    updated_at TEXT NOT NULL DEFAULT (datetime('now')), -- 更新日時
    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_characters_birth_id ON characters(birth_id);
CREATE INDEX idx_characters_gender ON characters(gender);

-- ============================================================================
-- 2. birthdata テーブル - 生年月日データ
-- ============================================================================
CREATE TABLE birthdata (
    birth_id TEXT PRIMARY KEY,             -- 出生データID (B001, B002, ...)
    calendar TEXT NOT NULL DEFAULT 'gregorian', -- 暦法 (gregorian, lunar)
    birth_date TEXT NOT NULL,              -- 生年月日 (ISO 8601: YYYY-MM-DD)
    birth_time TEXT,                       -- 出生時刻 (HH:MM)
    timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo', -- タイムゾーン
    location TEXT,                         -- 出生地
    latitude REAL,                         -- 緯度
    longitude REAL,                        -- 経度
    sex TEXT NOT NULL CHECK(sex IN ('male', 'female', 'other')), -- 性別
    source TEXT NOT NULL DEFAULT 'canon',  -- データソース (canon, calculated, verified)
    immutable BOOLEAN NOT NULL DEFAULT 0,  -- 変更禁止フラグ (0: 変更可, 1: 禁止)
    note TEXT,                             -- メモ
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- インデックス作成
CREATE INDEX idx_birthdata_date ON birthdata(birth_date);
CREATE INDEX idx_birthdata_location ON birthdata(location);

-- ============================================================================
-- 3. yinyang テーブル - 陰占データ（四柱推命、天中殺など）
-- ============================================================================
CREATE TABLE yinyang (
    yinyang_id TEXT PRIMARY KEY,           -- 陰占データID
    birth_id TEXT NOT NULL UNIQUE,         -- 出生データID
    system TEXT NOT NULL DEFAULT 'four_pillars', -- システム種別

    -- 四柱推命
    year_pillar TEXT NOT NULL,             -- 年柱 (例: "辛未")
    year_stem TEXT NOT NULL,               -- 年干 (例: "辛")
    year_branch TEXT NOT NULL,             -- 年支 (例: "未")

    month_pillar TEXT NOT NULL,            -- 月柱 (例: "庚寅")
    month_stem TEXT NOT NULL,              -- 月干 (例: "庚")
    month_branch TEXT NOT NULL,            -- 月支 (例: "寅")

    day_pillar TEXT NOT NULL,              -- 日柱 (例: "辛未")
    day_stem TEXT NOT NULL,                -- 日干 (例: "辛")
    day_branch TEXT NOT NULL,              -- 日支 (例: "未")

    hour_pillar TEXT,                      -- 時柱 (例: "乙未")
    hour_stem TEXT,                        -- 時干 (例: "乙")
    hour_branch TEXT,                      -- 時支 (例: "未")

    -- 日主情報
    day_master_stem TEXT NOT NULL,         -- 日干
    day_master_yinyang TEXT NOT NULL CHECK(day_master_yinyang IN ('yin', 'yang')), -- 陰陽
    day_master_element TEXT NOT NULL CHECK(day_master_element IN ('wood', 'fire', 'earth', 'metal', 'water')), -- 五行

    -- 天中殺
    tenchusatsu TEXT,                      -- 天中殺種別 (例: "申酉天中殺")
    tenchusatsu_branches TEXT,             -- 空亡の地支 (JSON配列: ["申", "酉"])

    -- 五行バランス
    five_wood INTEGER NOT NULL DEFAULT 0,  -- 木の点数
    five_fire INTEGER NOT NULL DEFAULT 0,  -- 火の点数
    five_earth INTEGER NOT NULL DEFAULT 0, -- 土の点数
    five_metal INTEGER NOT NULL DEFAULT 0, -- 金の点数
    five_water INTEGER NOT NULL DEFAULT 0, -- 水の点数

    -- 通変星・蔵干（JSONで保存）
    hidden_stems TEXT,                     -- 蔵干データ (JSON)
    tsuhensei TEXT,                        -- 通変星データ (JSON)

    -- 位相法
    phase_relations TEXT,                  -- 位相関係 (JSON: 合・冲・刑・害・破)

    -- 身強/身弱判定
    day_stem_strength TEXT CHECK(day_stem_strength IN ('strong', 'weak', 'balanced')),

    -- 拡張データ
    extensions TEXT,                       -- 拡張フィールド (JSON)

    -- メタデータ
    calculated_at TEXT NOT NULL DEFAULT (datetime('now')), -- 計算日時
    calculation_method TEXT DEFAULT 'accurate-logic',      -- 計算方法
    note TEXT,                             -- メモ

    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_yinyang_birth_id ON yinyang(birth_id);
CREATE INDEX idx_yinyang_day_master ON yinyang(day_master_stem);
CREATE INDEX idx_yinyang_tenchusatsu ON yinyang(tenchusatsu);

-- ============================================================================
-- 4. yangsen テーブル - 陽占データ（十大主星、十二大従星）
-- ============================================================================
CREATE TABLE yangsen (
    yangsen_id TEXT PRIMARY KEY,           -- 陽占データID
    birth_id TEXT NOT NULL UNIQUE,         -- 出生データID
    system TEXT NOT NULL DEFAULT 'sanmeigaku', -- システム種別

    -- 十大主星（9点配置）
    head_star TEXT NOT NULL,               -- 頭（第一命星）
    chest_star TEXT NOT NULL,              -- 胸（中心星）
    belly_star TEXT NOT NULL,              -- 腹
    left_hand_star TEXT NOT NULL,          -- 左手
    right_hand_star TEXT NOT NULL,         -- 右手

    -- 十二大従星（3点配置）
    left_shoulder_star TEXT NOT NULL,      -- 左肩（年支）
    left_shoulder_score INTEGER NOT NULL CHECK(left_shoulder_score BETWEEN 1 AND 12), -- 左肩の点数
    right_leg_star TEXT NOT NULL,          -- 右足（月支）
    right_leg_score INTEGER NOT NULL CHECK(right_leg_score BETWEEN 1 AND 12),       -- 右足の点数
    left_leg_star TEXT NOT NULL,           -- 左足（日支）
    left_leg_score INTEGER NOT NULL CHECK(left_leg_score BETWEEN 1 AND 12),         -- 左足の点数

    -- エネルギー点数
    total_energy_score REAL,               -- 総合エネルギー点数

    -- メタデータ
    calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
    calculation_method TEXT DEFAULT 'accurate-logic',
    note TEXT,

    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_yangsen_birth_id ON yangsen(birth_id);
CREATE INDEX idx_yangsen_head_star ON yangsen(head_star);
CREATE INDEX idx_yangsen_chest_star ON yangsen(chest_star);

-- ============================================================================
-- 5. dayun テーブル - 大運データ（10年周期）
-- ============================================================================
CREATE TABLE dayun (
    dayun_id TEXT PRIMARY KEY,             -- 大運データID
    birth_id TEXT NOT NULL,                -- 出生データID
    cycle_number INTEGER NOT NULL,         -- サイクル番号 (0-9: 0歳〜90歳)

    -- 大運基本情報
    start_age INTEGER NOT NULL,            -- 開始年齢
    end_age INTEGER NOT NULL,              -- 終了年齢
    stem TEXT NOT NULL,                    -- 天干
    branch TEXT NOT NULL,                  -- 地支
    pillar TEXT NOT NULL,                  -- 干支名

    -- 星情報
    ten_star TEXT NOT NULL,                -- 十大主星
    twelve_star TEXT NOT NULL,             -- 十二大従星
    twelve_star_score INTEGER,             -- 十二大従星の点数

    -- 大運属性
    direction TEXT CHECK(direction IN ('forward', 'backward')), -- 順行/逆行

    -- メタデータ
    calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
    note TEXT,

    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE,
    UNIQUE(birth_id, cycle_number)
);

-- インデックス作成
CREATE INDEX idx_dayun_birth_id ON dayun(birth_id);
CREATE INDEX idx_dayun_cycle ON dayun(birth_id, cycle_number);
CREATE INDEX idx_dayun_age_range ON dayun(start_age, end_age);

-- ============================================================================
-- 6. timeline テーブル - 年表データ
-- ============================================================================
CREATE TABLE timeline (
    timeline_id TEXT PRIMARY KEY,          -- 年表イベントID
    character_id TEXT NOT NULL,            -- キャラクターID
    birth_id TEXT NOT NULL,                -- 出生データID

    -- イベント基本情報
    event_type TEXT NOT NULL,              -- イベント種別 (major_cycle, life_event, milestone, etc.)
    start_age REAL NOT NULL,               -- 開始年齢（小数点対応: 25.5歳など）
    end_age REAL,                          -- 終了年齢
    period_start TEXT,                     -- 期間開始日 (YYYY-MM-DD)
    period_end TEXT,                       -- 期間終了日

    -- イベント内容
    theme TEXT NOT NULL,                   -- テーマ・タイトル
    description TEXT,                      -- 詳細説明
    category TEXT,                         -- カテゴリ (career, education, health, relationship, etc.)
    importance INTEGER CHECK(importance BETWEEN 1 AND 5), -- 重要度 (1-5)

    -- 関連データ
    related_dayun_cycle INTEGER,           -- 関連する大運サイクル番号
    tags TEXT,                             -- タグ (JSON配列)

    -- メタデータ
    source TEXT,                           -- データソース
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    note TEXT,

    FOREIGN KEY (character_id) REFERENCES characters(character_id) ON DELETE CASCADE,
    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_timeline_character_id ON timeline(character_id);
CREATE INDEX idx_timeline_birth_id ON timeline(birth_id);
CREATE INDEX idx_timeline_age_range ON timeline(start_age, end_age);
CREATE INDEX idx_timeline_event_type ON timeline(event_type);
CREATE INDEX idx_timeline_category ON timeline(category);

-- ============================================================================
-- 7. verification テーブル - 朱学院照合結果
-- ============================================================================
CREATE TABLE verification (
    verification_id TEXT PRIMARY KEY,      -- 照合ID
    birth_id TEXT NOT NULL,                -- 出生データID
    yinyang_id TEXT,                       -- 陰占データID
    yangsen_id TEXT,                       -- 陽占データID

    -- 照合元情報
    verification_source TEXT NOT NULL,     -- 照合元 (朱学院, 算命学Stock, etc.)
    verification_url TEXT,                 -- 照合元URL
    verification_date TEXT NOT NULL,       -- 照合日時

    -- 照合ステータス
    overall_status TEXT NOT NULL CHECK(overall_status IN ('verified', 'partial', 'discrepancy', 'error')), -- 全体ステータス
    yinyang_status TEXT CHECK(yinyang_status IN ('match', 'partial', 'mismatch')), -- 陰占照合結果
    yangsen_status TEXT CHECK(yangsen_status IN ('match', 'partial', 'mismatch')), -- 陽占照合結果

    -- 照合データ（朱学院等から取得した正解データ）
    verified_year_pillar TEXT,             -- 照合: 年柱
    verified_month_pillar TEXT,            -- 照合: 月柱
    verified_day_pillar TEXT,              -- 照合: 日柱
    verified_hour_pillar TEXT,             -- 照合: 時柱
    verified_tenchusatsu TEXT,             -- 照合: 天中殺

    verified_head_star TEXT,               -- 照合: 頭（第一命星）
    verified_chest_star TEXT,              -- 照合: 胸（中心星）
    verified_belly_star TEXT,              -- 照合: 腹
    verified_left_hand_star TEXT,          -- 照合: 左手
    verified_right_hand_star TEXT,         -- 照合: 右手
    verified_left_shoulder_star TEXT,      -- 照合: 左肩
    verified_right_leg_star TEXT,          -- 照合: 右足
    verified_left_leg_star TEXT,           -- 照合: 左足

    -- 不一致箇所の詳細
    discrepancies TEXT,                     -- 不一致詳細 (JSON)

    -- スクリーンショット・証拠
    screenshot_url TEXT,                   -- スクリーンショットURL
    raw_data TEXT,                         -- 生データ (JSON)

    -- メタデータ
    verified_by TEXT DEFAULT 'automated',  -- 照合実行者
    note TEXT,                             -- メモ
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (birth_id) REFERENCES birthdata(birth_id) ON DELETE CASCADE,
    FOREIGN KEY (yinyang_id) REFERENCES yinyang(yinyang_id) ON DELETE SET NULL,
    FOREIGN KEY (yangsen_id) REFERENCES yangsen(yangsen_id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX idx_verification_birth_id ON verification(birth_id);
CREATE INDEX idx_verification_source ON verification(verification_source);
CREATE INDEX idx_verification_status ON verification(overall_status);
CREATE INDEX idx_verification_date ON verification(verification_date);

-- ============================================================================
-- ビュー作成（よく使う結合クエリを定義）
-- ============================================================================

-- キャラクター基本情報と出生データの結合ビュー
CREATE VIEW v_character_birth AS
SELECT
    c.character_id,
    c.name,
    c.gender,
    b.birth_id,
    b.birth_date,
    b.birth_time,
    b.location,
    b.latitude,
    b.longitude
FROM characters c
JOIN birthdata b ON c.birth_id = b.birth_id;

-- キャラクターの陰陽占データ統合ビュー
CREATE VIEW v_character_complete_fortune AS
SELECT
    c.character_id,
    c.name,
    b.birth_date,
    y.year_pillar,
    y.day_pillar,
    y.tenchusatsu,
    ys.head_star,
    ys.chest_star,
    ys.total_energy_score,
    y.five_wood,
    y.five_fire,
    y.five_earth,
    y.five_metal,
    y.five_water
FROM characters c
JOIN birthdata b ON c.birth_id = b.birth_id
LEFT JOIN yinyang y ON b.birth_id = y.birth_id
LEFT JOIN yangsen ys ON b.birth_id = ys.birth_id;

-- 大運・年表統合ビュー
CREATE VIEW v_character_timeline AS
SELECT
    c.character_id,
    c.name,
    t.event_type,
    t.theme,
    t.start_age,
    t.end_age,
    d.cycle_number,
    d.pillar AS dayun_pillar,
    d.ten_star AS dayun_ten_star
FROM characters c
JOIN timeline t ON c.character_id = t.character_id
LEFT JOIN dayun d ON t.birth_id = d.birth_id AND t.related_dayun_cycle = d.cycle_number
ORDER BY c.character_id, t.start_age;

-- 照合結果ビュー
CREATE VIEW v_verification_summary AS
SELECT
    v.verification_id,
    c.name AS character_name,
    b.birth_date,
    v.verification_source,
    v.overall_status,
    v.yinyang_status,
    v.yangsen_status,
    v.verification_date
FROM verification v
JOIN birthdata b ON v.birth_id = b.birth_id
JOIN characters c ON b.birth_id = c.birth_id;

-- ============================================================================
-- トリガー作成（自動更新用）
-- ============================================================================

-- characters テーブルの updated_at 自動更新トリガー
CREATE TRIGGER trg_characters_updated_at
AFTER UPDATE ON characters
FOR EACH ROW
BEGIN
    UPDATE characters SET updated_at = datetime('now') WHERE character_id = OLD.character_id;
END;

-- birthdata テーブルの updated_at 自動更新トリガー
CREATE TRIGGER trg_birthdata_updated_at
AFTER UPDATE ON birthdata
FOR EACH ROW
BEGIN
    UPDATE birthdata SET updated_at = datetime('now') WHERE birth_id = OLD.birth_id;
END;

-- timeline テーブルの updated_at 自動更新トリガー
CREATE TRIGGER trg_timeline_updated_at
AFTER UPDATE ON timeline
FOR EACH ROW
BEGIN
    UPDATE timeline SET updated_at = datetime('now') WHERE timeline_id = OLD.timeline_id;
END;

-- verification テーブルの updated_at 自動更新トリガー
CREATE TRIGGER trg_verification_updated_at
AFTER UPDATE ON verification
FOR EACH ROW
BEGIN
    UPDATE verification SET updated_at = datetime('now') WHERE verification_id = OLD.verification_id;
END;

-- ============================================================================
-- 初期データ挿入（サンプル）
-- ============================================================================

-- characters テーブルのサンプルデータ
INSERT INTO characters (character_id, name, name_kana, gender, birth_id, description) VALUES
('C001', ' Meguru', 'めるぐ', 'male', 'B001', '西洛大学医学部出身の外科医。MedAI設立者。'),
('C002', 'Kei', 'けい', 'male', 'B002', 'Meguruの幼馴染。工学者。MedAI共同設立者。'),
('C003', 'Misaki', 'みさき', 'female', 'B003', 'Meguruの妹。西洛大学理学類学生。');

-- birthdata テーブルのサンプルデータ
INSERT INTO birthdata (birth_id, calendar, birth_date, birth_time, timezone, location, latitude, longitude, sex, source, immutable) VALUES
('B001', 'gregorian', '1991-03-02', '14:30', 'Asia/Tokyo', '京都', 35.0116, 135.7681, 'male', 'canon', 1),
('B002', 'gregorian', '1990-11-01', '10:15', 'Asia/Tokyo', '地方都市（架空）', NULL, NULL, 'male', 'canon', 1),
('B003', 'gregorian', '1997-08-14', '08:45', 'Asia/Tokyo', '東京', 35.6762, 139.6503, 'female', 'canon', 1);

-- ============================================================================
-- スキーマバージョン管理
-- ============================================================================

CREATE TABLE schema_migrations (
    version TEXT PRIMARY KEY,              -- バージョン番号
    applied_at TEXT NOT NULL DEFAULT (datetime('now')), -- 適用日時
    description TEXT                       -- 変更内容
);

INSERT INTO schema_migrations (version, description) VALUES
('1.0', 'Initial schema creation: characters, birthdata, yinyang, yangsen, dayun, timeline, verification');
