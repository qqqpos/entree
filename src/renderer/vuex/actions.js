import * as types from "./mutation-types";

export const startTick = ({ commit }) => {
  setInterval(() => {
    const time = Date.now();
    const a = new Date();
    const d = new Date(a.setHours(a.getHours() - 4));
    const date =
      d.getFullYear() +
      "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + d.getDate()).slice(-2);

    commit(types.START_TICK, { time, date });
  }, 1000);
};

export const setAppEnvironment = ({ commit }, { config, layout, menu, request, orders, tables, templates, books, lastSync }) => {
  commit(types.SET_CONFIG, config);
  commit(types.SET_LAYOUTS, layout);
  commit(types.SET_MENU, menu);
  commit(types.SET_REQUEST, request);
  commit(types.SET_TODAY_ORDER, orders);
  commit(types.SET_TABLES, tables);
  commit(types.SET_TEMPLATES, templates);
  commit(types.SET_BOOKS, books);
  commit(types.SET_SYNC, lastSync);
};

/* @ Setter */
export const setApp = ({ commit }, data) => commit(types.SET_APP, data);
export const setSync = ({ commit }, data) => commit(types.SET_SYNC, data);
export const setConfig = ({ commit }, data) => commit(types.SET_CONFIG, data);
export const setStation = ({ commit }, data) => commit(types.SET_STATION, data);
export const setCategory = ({ commit }, category) => commit(types.SET_CATEGORY, category);
export const setTemplates = ({ commit }, templates) => commit(types.SET_TEMPLATES, templates);
export const setBooks = ({ commit }, book) => commit(types.SET_BOOKS, book);
export const setMenu = ({ commit }, menu) => commit(types.SET_MENU, menu);
export const setLayout = ({ commit }, layout) => commit(types.SET_LAYOUTS, layout);
export const setRequest = ({ commit }, request) => commit(types.SET_REQUEST, request);
export const setOperator = ({ commit }, operator) => commit(types.SET_OPERATOR, operator);
export const setTicket = ({ commit }, data) => commit(types.SET_TICKET, data);
export const setCustomer = ({ commit }, data) => commit(types.SET_CUSTOMER, data);
export const resetCustomer = ({ commit }) => commit(types.RESET_CUSTOMER);
export const setFavorites = ({ commit }, data) => commit(types.SET_FAVORITES, data);
export const setOrder = ({ commit }, data) => commit(types.SET_ORDER, data);
export const setSides = ({ commit }, sides) => commit(types.SET_SIDES, sides);
export const setViewTable = ({ commit }, table) => commit(types.SET_VIEW_TABLE, table);
export const resetViewTable = ({ commit }) => commit(types.RESET_VIEW_TABLE);
export const setViewOrder = ({ commit }, order) => commit(types.SET_VIEW_ORDER, order);
export const setDevice = ({ commit }, data) => commit(types.SET_DEVICE, data);
export const phoneRing = ({ commit }, data) => commit(types.PHONE_RING, data);
export const resetTable = ({ commit }) => commit(types.RESET_TABLE);
export const delayPrint = ({ commit }, order) => commit(types.ADD_SPOOLER, order);
export const removeSpooler = ({ commit }, index) => commit(types.REMOVE_SPOOLER, index);
export const addToOrder = ({ commit, getters }, item) => commit(types.ADD_TO_ORDER, { item, autoStack: getters.config.defaults.autoStackItem });
export const pushToOrder = ({ commit }, item) => commit(types.PUSH_TO_ORDER, item);
export const setPointer = ({ commit }, target) => commit(types.SET_POINTER, target);
export const resetPointer = ({ commit }) => commit(types.RESET_POINTER);
export const lessQty = ({ commit }, bool) => commit(types.LESS_QTY, bool);
export const moreQty = ({ commit }) => commit(types.MORE_QTY);
export const alterItem = ({ commit }, item) => commit(types.ALTER_ITEM, item);
export const splitItem = ({ commit }, item) => commit(types.SPLIT_ITEM, item);
export const alertChoiceSet = ({ commit }, set) => commit(types.ALERT_CHOICE_SET, set);
export const resetChoiceSet = ({ commit }) => commit(types.RESET_CHOICE_SET);
export const emptyChoiceSet = ({ commit }, target) => commit(types.EMPTY_CHOICE_SET, target);
export const setChoiceSetTarget = ({ commit }, target) => commit(types.SET_CHOICE_SET_TARGET, target);
export const setPriceForChoiceSet = ({ commit }, price) => commit(types.SET_PRICE_FOR_CHOICE_SET, price);
export const updateTable = ({ commit }, table) => commit(types.UPDATE_TABLE, table);
export const updateMenuCategory = ({ commit }, data) => { commit(types.UPDATE_MENU_CATEGORY, data) };
export const setTodayOrder = ({ commit }, orders) => commit(types.SET_TODAY_ORDER, orders);
export const createOrderInstance = ({ commit }, data) => commit(types.CREATE_ORDER_INSTANCE, data);
export const archiveOrder = ({ commit }, data) => commit(types.ARCHIVE_ORDER, data);
export const emptyArchiveOrder = ({ commit }) => commit(types.EMPTY_ARCHIVE_ORDER);
export const emptyCustomerInfo = ({ commit }, data) => commit(types.EMPTY_CUSTOMER_INFO, data);
export const newPhoneCall = ({ commit }, data) => commit(types.NEW_PHONE_CALL, data);

export const setChoiceSet = ({ commit, getters }, subitem) => commit(types.SET_CHOICE_SET, { subitem, matchItemQty: getters.config.defaults.matchItemQty });
export const alterItemOption = ({ commit, getters }, data) => {
  const subitem = {
    qty: 1,
    single: parseFloat(data.side.price) || 0,
    price: parseFloat(data.side.price) || 0,
    usEN: data.side.usEN,
    zhCN: data.side.zhCN
  };

  data.side.sub
    ? commit(types.SET_CHOICE_SET, { subitem, matchItemQty: getters.config.defaults.matchItemQty })
    : commit(types.ALTER_ITEM_OPTION, data);
};

export const resetOrder = ({ commit }, resetArchive) => {
  resetArchive && commit(types.EMPTY_ARCHIVE_ORDER);
  
  commit(types.RESET_ORDER);
  commit(types.SET_TICKET, { type: "" });
  commit(types.SET_APP, { newTicket: true });
};

export const resetAll = ({ commit }) => {
  commit(types.RESET_ORDER);
  commit(types.RESET_TABLE);
  commit(types.RESET_CUSTOMER);
  commit(types.EMPTY_ARCHIVE_ORDER);
  commit(types.SET_TICKET, { type: "" });
  commit(types.SET_APP, { newTicket: true });
};

export const insertOrder = ({ commit, rootState }, { order, refresh }) => {
  commit(types.UPSERT_INVOICE, order);
  refresh && commit(types.REFRESH_CURRENT_ORDER, rootState.initial.orders);
};
export const updateOrder = ({ commit, rootState }, { order, refresh }) => {
  commit(types.UPSERT_INVOICE, order);
  refresh && commit(types.REFRESH_CURRENT_ORDER, rootState.initial.orders);
};

export const updateMenu = ({ commit }, { target, action, data }) => {
  switch (target) {
    case "MENU CATEGORY":
      switch (action) {
        case "UPDATE":
          commit(types.UPDATE_MENU_CATEGORY, data)
          break;
        case "SORT":
          commit(types.SET_LAYOUTS, data)
      }
      break;
    case "MENU ITEM":
      switch (action) {
        case "UPDATE":
          commit(types.UPDATE_MENU_ITEM, data)
          break;
        case "REMOVE":
          commit(types.REMOVE_MENU_ITEM, data)
          break;
      }
      break;
    case "REQUEST CATEGORY":
      switch (action) {
        case "UPDATE":
          commit(types.UPDATE_REQUEST_CATEGORY, data)
          break;
        case "SORT":
          commit(types.SET_LAYOUTS, data)
          break;
      }
      break;
    case "REQUEST ACTION":
      switch (action) {
        case "UPDATE":
          commit(types.UPDATE_REQUEST_ACTION, data)
          break;
        case "SORT":
          commit(types.SET_LAYOUTS, data)
          break;
      }
      break;
    case "REQUEST ITEM":
      switch (action) {
        case "UPDATE":
          commit(types.UPDATE_REQUEST_ITEM, data)
          break;
        case "REMOVE":
          commit(types.REMOVE_REQUEST_ITEM, data)
          break;
      }
      break;
    case "TEMPLATE":
      commit(types.SET_TEMPLATES, data)
      break;
    case "TABLE SECTION":
      switch (action) {
        case "REPLACE":
          commit(types.SET_LAYOUTS, data)
          break;
        case "REMOVE":
          commit(types.REMOVE_TABLE_SECTION, data)
          break;
      }
      break;
    case "TABLE":
      switch (action) {
        case "SWAP":
          commit(types.UPDATE_SECTION_TABLES, data)
          break;
        case "REPLACE":
          commit(types.REPLACE_TABLE, data)
          break;
        case "REMOVE":
          commit(types.REMOVE_TABLE, data)
          break;
      }
      break;
  }
}
