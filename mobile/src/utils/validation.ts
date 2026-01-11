// バリデーション関数

/**
 * 生年月日のバリデーション
 * @param date 検証する日付
 * @returns バリデーション結果
 */
export function validateBirthDate(date: Date): { valid: boolean; error?: string } {
  if (date.getFullYear() < 1900) {
    return { valid: false, error: '1900年以降の日付を入力してください' };
  }
  if (date > new Date()) {
    return { valid: false, error: '未来の日付は選択できません' };
  }
  if (date.getFullYear() > 2100) {
    return { valid: false, error: '2100年以前の日付を入力してください' };
  }
  return { valid: true };
}

/**
 * 経度のバリデーション
 * @param lng 経度
 * @returns バリデーション結果
 */
export function validateLongitude(lng: number): { valid: boolean; error?: string } {
  if (lng < -180 || lng > 180) {
    return { valid: false, error: '経度は-180〜180度の範囲で入力してください' };
  }
  return { valid: true };
}
