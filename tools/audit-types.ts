/**
 * キャラクター監査用型定義
 */

export interface CharacterIndex {
  characters: IndexedCharacter[];
  generatedAt: string;
}

export interface IndexedCharacter {
  id: string; // 一意ID (例: ep77-tetsuda-tsuyoshi)
  episode: string; // EP番号
  name: {
    kanji: string;
    reading: string;
    surname: string;
    given: string;
  };
  birthDate: string; // ISO 8601
  age: number;
  occupation: string;
  family: string;
  gender: "male" | "female" | "unknown";
  hasPersona: boolean;
  personaPath?: string;
}

export interface DuplicateReport {
  generatedAt: string;
  summary: {
    totalCharacters: number;
    duplicatesFound: number;
    priority1: number;
    priority2: number;
    priority3: number;
  };
  priority1: ExactDuplicate[];
  priority2: PartialDuplicate[];
  priority3: SimilarSettings[];
}

export interface ExactDuplicate {
  type: "完全一致";
  characters: string[];
  field: "名前" | "苗字" | "名前+読み";
  details: string;
}

export interface PartialDuplicate {
  type: "部分一致";
  characters: string[];
  field: "同じ名前" | "同じ苗字" | "同じ読み" | "読みが類似";
  details: string;
}

export interface SimilarSettings {
  type: "設定類似";
  characters: string[];
  field: "職業" | "家族構成" | "年齢" | "職業+家族構成";
  details: string;
}

export interface IdentityValidation {
  characterId: string;
  file: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface SoulValidation {
  characterId: string;
  file: string;
  valid: boolean;
  errors: ValidationError[];
  inconsistencies: Inconsistency[];
}

export interface Inconsistency {
  field: string;
  identityValue: string;
  soulValue: string;
  severity: "error" | "warning";
}

export interface MappingValidation {
  charactersInEp: number;
  personasFound: number;
  orphanedPersonas: string[];
  missingPersonas: string[];
  mappingErrors: MappingError[];
}

export interface MappingError {
  epFile: string;
  characterName: string;
  expectedPersona: string;
  actualPersona?: string;
}

// EPファイルからパースしたキャラクター情報
export interface ParsedEPCharacter {
  episodeNumber: string;
  name: string;
  nameReading?: string;
  birthDate?: string;
  age?: number;
  gender?: "male" | "female";
  occupation?: string;
  family?: string;
  rawText: string;
}

// Identity.mdからパースした情報
export interface ParsedIdentity {
  name: string;
  reading: string;
  birthDate: string;
  age: number;
  gender: "male" | "female" | "unknown";
  occupation: string;
  birthplace?: string;
  family: string;
  episode: string;
  personaPath: string;
}
