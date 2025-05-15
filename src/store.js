// src/store.js
import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  menuList: [],       // 전체 메뉴
  topMenu: null,      // 선택된 상단 메뉴의 menuSeq
  codeMap: {},        // ✅ 공통코드 저장용
  loading: false,      // ✅ 전역 로딩 상태 추가
  selectedSystem: null, // ✅ 전역 시스템 선택값
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
