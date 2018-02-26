import * as types from "../mutation-types";
import Preset from "../../preset";

const state = {
  customer: Preset.customer(),
  favorites: []
};

const mutations = {
  [types.SET_CUSTOMER](state, data) {
    state.customer = Object.assign({}, state.customer, data);
  },
  [types.RESET_CUSTOMER](state) {
    state.customer = Preset.customer();
    state.favorites = [];
  },
  [types.EMPTY_CUSTOMER_INFO](state, data) {
    state.customer = Object.assign(
      {
        phone: "",
        extension: "",
        address: "",
        city: "",
        name: "",
        note: ""
      },
      data
    );
  },
  [types.SET_FAVORITES](state, data) {
    state.favorites = data;
  }
};

export default {
  state,
  mutations
};
