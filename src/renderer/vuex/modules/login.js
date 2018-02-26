import * as types from '../mutation-types'

const state = {
  password: [],
  op: {}
}

const mutations = {
  [types.SET_PIN](state, password) {
    typeof password === 'undefined' ?
      state.password = [] :
      state.password.push(password)
  },
  [types.DEL_PIN](state) {
    state.password.pop()
  },
  [types.SET_OP](state, data) {
    state.op = data ? Object.assign({}, state.op, data) : {};
  }
}

export default {
  state,
  mutations
}
