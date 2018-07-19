import * as types from '../mutation-types'

const state = {
  viewTable: null
}

const mutations = {
  [types.SET_VIEW_TABLE](state, table) {
    state.viewTable = Object.assign({}, state.viewTable, table);
  },
  [types.RESET_TABLE](state) {
    state.viewTable = null;
  }
}

export default {
  state,
  mutations
}
