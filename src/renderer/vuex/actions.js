import * as types from "./mutation-types";

export const startTick = ({ commit }) => {
  setInterval(() => {
    const time = new Date().getTime();
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

/* @ Setter */
export const setApp = ({ commit }, data) => commit(types.SET_APP, data);

export const setConfig = ({ commit }, data) => commit(types.SET_CONFIG, data);

export const setStation = ({ commit }, data) => commit(types.SET_STATION, data);

export const setCategory = ({ commit }, category) =>
  commit(types.SET_CATEGORY, category);

export const setTemplates = ({ commit }, templates) =>
  commit(types.SET_TEMPLATES, templates);

export const setReservation = ({ commit }, data) => {
  let { sync, reservations } = data;
  commit(types.SET_RESERVATION, reservations);
  commit(types.SET_LASTSYNC, sync);
};
export const setLastSync = ({ commit }, time) =>
  commit(types.SET_LASTSYNC, time);

export const setMenu = ({ commit }, menu) => commit(types.SET_MENU, menu);

export const setSubmenu = ({ commit }, submenu) =>
  commit(types.SET_SUBMENU, submenu);

export const setTable = ({ commit }, tables) => commit(types.SET_TABLE, tables);

export const setTemporaryTable = ({ commit }, table) =>
  commit(types.SET_TEMPORARY_TABLE, table);

export const setRequest = ({ commit }, request) =>
  commit(types.SET_REQUEST, request);

export const setOp = ({ commit }, op) => commit(types.SET_OP, op);

export const setTicket = ({ commit }, data) => commit(types.SET_TICKET, data);

export const setCustomer = ({ commit }, data) =>
  commit(types.SET_CUSTOMER, data);

export const setFavorites = ({ commit }, data) =>
  commit(types.SET_FAVORITES, data);

export const setPin = ({ commit }, pin) => commit(types.SET_PIN, pin);

export const setOrder = ({ commit }, data) => commit(types.SET_ORDER, data);

export const setSides = ({ commit }, sides) => commit(types.SET_SIDES, sides);

export const setCurrentTable = ({ commit }, info) =>
  commit(types.SET_CURRENT_TABLE, info);

export const resetCurrentTable = ({ commit }) =>
  commit(types.RESET_CURRENT_TABLE);

export const setViewOrder = ({ commit }, order) =>
  commit(types.SET_VIEW_ORDER, JSON.parse(JSON.stringify(order)));

export const setDevice = ({ commit }, data) => commit(types.SET_DEVICE, data);

export const phoneRing = ({ commit }, data) => commit(types.PHONE_RING, data);

export const resetCustomer = ({ commit }) => commit(types.RESET_CUSTOMER);

export const resetTable = ({ commit }) => commit(types.RESET_TABLE);

export const resetMenu = ({ commit }) => commit(types.RESET_MENU);

export const resetAll = ({ commit }) => {
  commit(types.RESET_MENU);
  commit(types.RESET_TABLE);
  commit(types.RESET_CUSTOMER);
  commit(types.SET_TICKET, { type: "" });
  commit(types.SET_APP, { newTicket: true });
};
export const updateMenuItem = ({ commit }, data) =>
  commit(types.UPDATE_MENU_ITEM, data);

export const removeMenuItem = ({ commit }, data) =>
  commit(types.REMOVE_MENU_ITEM, data);

export const updateRequestCategory = ({ commit }, data) =>
  commit(types.UPDATE_REQUEST_CATEGORY, data);

export const updateRequestItem = ({ commit }, data) =>
  commit(types.UPDATE_REQUEST_ITEM, data);

export const updateRequestAction = ({ commit }, data) =>
  commit(types.UPDATE_REQUEST_ACTION, data);

export const removeRequestItem = ({ commit }, id) =>
  commit(types.REMOVE_REQUEST_ITEM, id);

export const delPin = ({ commit }) => commit(types.DEL_PIN);

export const delayPrint = ({ commit }, order) =>
  commit(types.ADD_SPOOLER, order);

export const removeSpooler = ({ commit }, index) =>
  commit(types.REMOVE_SPOOLER, index);

export const addToOrder = ({ commit }, item) =>
  commit(types.ADD_TO_ORDER, item);

export const setPointer = ({ commit }, target) =>
  commit(types.SET_POINTER, target);

export const resetPointer = ({ commit }) => commit(types.RESET_POINTER);

export const lessQty = ({ commit }, bool) => commit(types.LESS_QTY, bool);

export const moreQty = ({ commit }) => commit(types.MORE_QTY);

export const alterItem = ({ commit }, item) => commit(types.ALTER_ITEM, item);

export const alterItemOption = ({ commit }, data) => {
  data.side.sub
    ? commit(types.SET_CHOICE_SET, {
        qty: 1,
        single: data.side.price || 0,
        price: data.side.price || 0,
        usEN: data.side.usEN,
        zhCN: data.side.zhCN
      })
    : commit(types.ALTER_ITEM_OPTION, data);
};
export const setChoiceSet = ({ commit }, set) =>
  commit(types.SET_CHOICE_SET, set);

export const alertChoiceSet = ({ commit }, set) =>
  commit(types.ALERT_CHOICE_SET, set);

export const resetChoiceSet = ({ commit }) => commit(types.RESET_CHOICE_SET);

export const emptyChoiceSet = ({ commit }) => commit(types.EMPTY_CHOICE_SET);

export const setChoiceSetTarget = ({ commit }, target) =>
  commit(types.SET_CHOICE_SET_TARGET, target);

export const setPriceForChoiceSet = ({ commit }, price) =>
  commit(types.SET_PRICE_FOR_CHOICE_SET, price);

export const updateTable = ({ commit }, data) => {
  const { table, sync } = data;

  commit(types.SET_LASTSYNC, sync);
  commit(types.UPDATE_TABLE_STATUS, table);
};
export const insertOrder = ({ commit, rootState }, data) => {
  const { number, sync, order, refresh } = data;

  commit(types.SET_TICKET, { number });
  commit(types.SET_LASTSYNC, sync);
  commit(types.UPSERT_INVOICE, order);
  refresh && commit(types.REFRESH_CURRENT_ORDER, rootState.initial.orders);
};
export const updateOrder = ({ commit, rootState }, data) => {
  let { sync, order, refresh } = data;
  commit(types.SET_LASTSYNC, sync);
  commit(types.UPSERT_INVOICE, order);
  refresh && commit(types.REFRESH_CURRENT_ORDER, rootState.initial.orders);
};
export const updateMenuCategory = ({ commit }, data) => {
  commit(types.UPDATE_MENU_CATEGORY, data);
};
export const setTodayOrder = ({ commit }, data) => {
  let { sync, orders } = data;
  commit(types.SET_LASTSYNC, sync);
  commit(types.SET_TODAYORDER, orders);
};
export const syncTables = ({ commit }, data) => {
  let { sync, tables } = data;
  commit(types.SET_LASTSYNC, sync);
  commit(types.SET_TABLE, tables);
};
export const newPhoneCall = ({ commit }, data) =>
  commit(types.NEW_PHONE_CALL, data);

export const setPrinter = ({ commit }, data) => commit(types.SET_PRINTER, data);

export const removePrinter = ({ commit }, data) =>
  commit(types.REMOVE_PRINTER, data);

export const replaceMenu = ({ commit }, data) =>
  commit(types.REPLACE_MENU, data);

export const replaceRequestItem = ({ commit }, data) =>
  commit(types.REPLACE_REQUEST_ITEM, data);

export const updateTableSection = ({ commit }, data) =>
  commit(types.UPDATE_TABLE_SECTION, data);

export const setTableSort = ({ commit }, data) =>
  commit(types.SET_TABLE_SORT, data);

export const replaceTable = ({ commit }, data) =>
  commit(types.REPLACE_TABLE, data);

export const removeTable = ({ commit }, data) =>
  commit(types.REMOVE_TABLE, data);

export const newReservation = ({ commit }, data) =>
  commit(types.NEW_RESERVATION, data);

export const updateReservation = ({ commit }, data) =>
  commit(types.UPDATE_RESERVATION, data);

export const saveForDiffs = ({ commit }, data) =>
  commit(types.SAVE_FOR_DIFFS, data);

export const archiveOrder = ({ commit }, data) =>
  commit(types.ARCHIVE_ORDER, data);

export const emptyCustomerInfo = ({ commit }, data) =>
  commit(types.EMPTY_CUSTOMER_INFO, data);
