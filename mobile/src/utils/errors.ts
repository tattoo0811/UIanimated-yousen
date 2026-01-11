// エラークラス定義

/**
 * 計算エラー
 */
export class CalculationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * ストレージエラー
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}
