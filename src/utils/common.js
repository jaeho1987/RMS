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

/**
 * 코드맵에서 codeId에 해당하는 codeName을 반환합니다.
 *
 * @param {object} codeMap - Redux에서 가져온 codeMap 객체
 * @param {string} group - 코드 그룹명 (예: 'REQ_TYPE', 'REQ_PRIORITY', 'REQ_STATUS')
 * @param {string|number} codeId - 매칭할 코드 ID
 * @returns {string} 해당 코드명의 문자열, 없으면 빈 문자열 반환
 *
 * @example
 * getCodeName(codeMap, 'REQ_TYPE', 'F01') // → '기능요구'
 */
export const getCodeName = (codeMap, group, codeId) => {
  return (codeMap[group] || []).find(c => c.codeId === codeId)?.codeName || ''
}

/**
 * 코드맵에서 지정한 그룹의 코드 목록을 select box 옵션용 배열로 반환합니다.
 *
 * @param {object} codeMap - Redux에서 가져온 codeMap 객체
 * @param {string} group - 코드 그룹명
 * @returns {Array<{ id: string|number, value: string }>} 일반 select용
 *
 * @example
 * getCodeOptions(codeMap, 'REQ_PRIORITY') // → [{ id: 'H', value: '높음' }, ...]
 */
export const getCodeOptions = (codeMap, group) => {
  return (codeMap[group] || []).map(code => ({
    id: code.codeId,
    value: code.codeName
  }))
}

/**
 * DHTMLX Gantt 전용 select editor용 옵션 배열 반환
 *
 * @param {object} codeMap - Redux에서 가져온 codeMap 객체
 * @param {string} group - 코드 그룹명
 * @returns {Array<{ key: string|number, label: string }>} Gantt 전용 select 옵션
 *
 * @example
 * getCodeOptionsForGantt(codeMap, 'REQ_TYPE')
 * // → [{ key: 'F01', label: '기능요구' }, ...]
 */
export const getCodeOptionsForGantt = (codeMap, group) => {
  return (codeMap[group] || []).map(code => ({
    key: code.codeId,
    label: code.codeName
  }))
}
