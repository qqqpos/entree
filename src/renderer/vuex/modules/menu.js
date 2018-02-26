import * as types from "../mutation-types";

const state = {
  order: {
    payment: {
      subtotal: 0,
      tax: 0,
      total: 0,
      due: 0,
      balance: 0,
      paid: 0,
      gratuity: 0,
      tip: 0,
      discount: 0,
      delivery: 0,
      surcharge: 0,
      remain: 0,
      log: []
    },
    content: [],
    coupons: [],
    source: "POS"
  },
  diffs: null,
  archivedOrder: null,
  item: null,
  sides: [],
  choiceSetTarget: null,
  lastActionTime: +new Date()
};
const mutations = {
  [types.RESET_MENU](state) {
    state.order = {
      _id: ObjectId(),
      payment: {
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        surcharge: 0,
        remain: 0,
        log: []
      },
      content: [],
      coupons: [],
      date: today(),
      source: "POS"
    };
    state.item = null;
    state.choiceSetTarget = null;
    state.diffs = null;
    state.archivedOrder = null;
    state.sides = Array(11).fill({ zhCN: "", usEN: "", disable: true });
  },
  [types.SET_VIEW_ORDER](state, order) {
    state.order = JSON.parse(JSON.stringify(order));
  },
  [types.SET_SIDES](state, sides) {
    state.sides = sides;
  },
  [types.SET_POINTER](state, item) {
    state.item = item;
    let sides = item.option.slice();
    Array(11 - sides.length)
      .fill()
      .forEach(_ => sides.push({ zhCN: "", usEN: "", disable: true }));
    state.sides = sides;
  },
  [types.RESET_POINTER](state) {
    state.item = state.order.content.last();
    let sides = state.item ? state.item.option.slice() : [];
    Array(11 - sides.length)
      .fill()
      .forEach(_ => sides.push({ zhCN: "", usEN: "", disable: true }));
    state.sides = sides;
    state.choiceSetTarget = null;
  },
  [types.ADD_TO_ORDER](state, item) {
    delete item.clickable;
    Object.assign(item, {
      unique: String().random(),
      print: false,
      pending: false,
      void: false,
      qty: item.qty || 1,
      choiceSet: item.choiceSet ? item.choiceSet : [],
      side: item.side ? item.side : {},
      single: parseFloat(item.price[0]),
      total: item.hasOwnProperty("total")
        ? item.total
        : item.price[0].toFixed(2)
    });
    if (state.item) {
      const insert =
        state.order.content.findIndex(item => item === state.item) + 1;
      state.order.content.splice(insert, 0, item);
      let dom = document.querySelectorAll("li.item");
      let length = dom.length;
      let index;
      dom.forEach((div, i) => {
        if (div.className.indexOf("active") !== -1) {
          dom[i].classList.remove("active");
          state.item = state.order.content.last();
          index = i + 1;
        }
      });
      if (index !== length) {
        dom[index] && dom[index].classList.add("active");
        state.item = state.order.content[insert];
      }
    } else {
      state.order.content.push(item);
      state.item = state.order.content.last();
    }
    state.choiceSetTarget = null;
  },
  [types.ALTER_ITEM](state, item) {
    const index = state.order.content.findIndex(item => item === state.item);
    state.order.content.splice(index, 1, item);
    state.item = item;
  },
  [types.ALTER_ITEM_OPTION](state, data) {
    const {
      disable,
      overWrite = false,
      replace = false,
      price,
      extra,
      zhCN,
      usEN,
      skip = false,
      ignore = false
    } = data.side;
    let { item } = state;

    if (disable) return;
    if (data.split) return;

    const _zhCN = `[${zhCN}]`;
    const _usEN = `[${usEN}]`;

    if (item.qty === 1) {
      if (
        item.side.zhCN === _zhCN &&
        item.side.usEN === _usEN &&
        !data.function
      ) {
        item.total = (++item.qty * item.single).toFixed(2);
      } else {
        if (isNumber(price)) {
          item.single = parseFloat(price);
        } else if (isNumber(item.price[data.index])) {
          item.single = parseFloat(item.price[data.index]);
        } else if (isNumber(extra)) {
          item.single = parseFloat(item.price[0]) + parseFloat(extra);
        }

        item.total = item.single.toFixed(2);
        if (overWrite || replace) {
          item.zhCN = zhCN;
          item.usEN = usEN;
          return;
        }

        if (data.function) item.side = {};

        const assignSide = !(skip || ignore);

        if (assignSide) item.side = { zhCN: _zhCN, usEN: _usEN };
      }
    } else {
      if (item.side.zhCN === _zhCN && item.side.usEN === _usEN) {
        item.total = data.function
          ? (item.qty * item.single).toFixed(2)
          : (++item.qty * item.single).toFixed(2);
      } else {
        item.total = (--item.qty * item.single).toFixed(2);

        let _item = JSON.parse(JSON.stringify(item));
        _item.unique = String().random();
        _item.qty = 1;
        _item.side = { zhCN: _zhCN, usEN: _usEN };

        if (isNumber(price)) {
          _item.single = parseFloat(price);
        } else if (isNumber(item.price[data.index])) {
          _item.single = parseFloat(item.price[data.index]);
        } else if (isNumber(extra)) {
          _item.single =
            parseFloat(item.price[0]) + parseFloat(data.side.extra);
        }

        _item.total = _item.single.toFixed(2);

        const dom = document.querySelector("li.item.active");
        dom && dom.classList.remove("active");

        const index =
          state.order.content.findIndex(i => i.unique === item.unique) + 1;

        state.order.content.splice(index, 0, _item);
        state.item = _item;

        setTimeout(() =>
          document.querySelectorAll("li.item")[index].classList.add("active")
        );
      }
    }
  },
  [types.LESS_QTY](state, delChoiceSetFirst) {
    if (state.order.content.length === 0) return;
    if (state.item.split) return;

    if (state.choiceSetTarget) {
      let { qty, single } = state.choiceSetTarget;

      if (qty === 1) {
        state.order.content.forEach(item => {
          item.choiceSet.forEach((set, index) => {
            if (set === state.choiceSetTarget) {
              item.choiceSet.splice(index, 1);
              state.choiceSetTarget =
                item.choiceSet.length > index ? item.choiceSet[index] : null;
            }
          });
        });
      } else {
        state.choiceSetTarget.price = toFixed(
          --state.choiceSetTarget.qty * single,
          2
        ).toFixed(2);
      }
    } else if (delChoiceSetFirst) {
      let set = state.item.choiceSet.last();
      set &&
        (set.qty === 1
          ? state.item.choiceSet.pop()
          : (set.price = toFixed(--set.qty * set.single, 2).toFixed(2)));
    } else {
      const currentActionTime = +new Date();
      const diff = currentActionTime - state.lastActionTime;

      state.item = state.item || state.order.content.last();

      if (state.item.qty !== 1 && diff > 250) {
        state.item.total = toFixed(
          --state.item.qty * state.item.single,
          2
        ).toFixed(2);
        state.order.content.splice();
      } else {
        state.order.content.remove(state.item);
        state.item = state.order.content.last();
        let dom = document.querySelector(".item.active");
        dom && dom.classList.remove("active");
        let sides = state.order.content.length
          ? state.order.content.last().option.slice()
          : [];
        Array(11 - sides.length)
          .fill()
          .forEach(_ => sides.push({ zhCN: "", usEN: "", disable: true }));
        state.sides = sides;
      }
    }
    state.lastActionTime = +new Date();
  },
  [types.MORE_QTY](state) {
    if (state.order.content.length === 0) return;
    if (state.item.split) return;

    if (state.choiceSetTarget && state.choiceSetTarget.qty < 99) {
      state.choiceSetTarget.price = (
        ++state.choiceSetTarget.qty * state.choiceSetTarget.single
      ).toFixed(2);
    } else {
      state.item.total = toFixed(
        ++state.item.qty * state.item.single,
        2
      ).toFixed(2);
      state.order.content.splice();
    }
  },
  [types.SET_CHOICE_SET](state, set) {
    if (state.order.content.length === 0) return;
    if (state.item.split) return;

    set.unique = String().random();

    const dom = document.querySelector(".sub.target");
    if (dom) {
      const { key } = dom.dataset;
      const index = state.item.choiceSet.findIndex(s => s.key === key) + 1;

      state.item.choiceSet.splice(index, 0, set);
      dom.classList.remove("target");
    } else {
      state.item.choiceSet.push(set);
      state.choiceSetTarget = set;
    }
  },
  [types.ALERT_CHOICE_SET](state, set) {
    const { zhCN, usEN } = set;

    state.choiceSetTarget.zhCN = `${state.choiceSetTarget.zhCN} ${zhCN}`;
    state.choiceSetTarget.usEN = `${state.choiceSetTarget.usEN} ${usEN}`;
    state.choiceSetTarget.unique = String().random();
  },
  [types.RESET_CHOICE_SET](state) {
    state.choiceSetTarget = null;
  },
  [types.EMPTY_CHOICE_SET](state) {
    state.item.choiceSet = [];
  },
  [types.SET_PRICE_FOR_CHOICE_SET](state, data) {
    if (!state.choiceSetTarget) return;
    if (state.item.split) return;

    const single = data.single || data.total;
    const qty = data.qty || 1;
    const price = toFixed(single * qty, 2).toFixed(2);
    Object.assign(state.choiceSetTarget, { qty, single, price });
  },
  [types.SET_CHOICE_SET_TARGET](state, target) {
    state.choiceSetTarget = target;
  },
  [types.SET_ORDER](state, data) {
    state.order = Object.assign({}, state.order, data);
    state.item = state.order.content.last();

    const dom = document.querySelector("li.item.active");
    dom && dom.classList.remove("active");
  },
  [types.REFRESH_CURRENT_ORDER](state, orders) {
    if (state.order.hasOwnProperty("status")) {
      const _id = state.order._id;
      const length = orders.length;

      for (let i = 0; i < length; i++) {
        if (orders[i]._id === _id) {
          state.order = Object.assign({}, orders[i]);
          break;
        }
      }
    }
  },
  [types.SAVE_FOR_DIFFS](state, data) {
    state.diffs = JSON.parse(JSON.stringify(data));
  },
  [types.ARCHIVE_ORDER](state, data) {
    state.archivedOrder = JSON.parse(JSON.stringify(data));
  }
};

export default {
  state,
  mutations
};
