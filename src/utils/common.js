/**
 * 객체의 모든 null 또는 undefined 값을 fallback 값으로 치환한 새 객체를 반환합니다.
 *
 * ⚠️ 주의: 원본 객체는 변경하지 않고, 새로운 객체를 반환합니다.
 *
 * @param {Object} obj - 대상 객체 (예: API 응답 등)
 * @param {*} fallback - 기본값 (기본값은 빈 문자열 '')
 * @returns {Object} null/undefined가 fallback으로 치환된 새 객체
 *
 * @example
 * normalizeObject({ name: null, age: undefined, gender: 'M' })
 * // 결과: { name: '', age: '', gender: 'M' }
 */
export const normalizeObject = (obj, fallback = '') =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value ?? fallback])
  )
