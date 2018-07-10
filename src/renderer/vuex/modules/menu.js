import * as types from "../mutation-types";
import { isNumber } from "util";

const state = {
  order: {
    customer: {},
    payment: {
      subtotal: 0,
      tax: 0,
      plasticTax: 0,
      total: 0,
      due: 0,
      balance: 0,
      paid: 0,
      gratuity: 0,
      tip: 0,
      discount: 0,
      delivery: 0,
      surcharge: 0,
      rounding: 0,
      remain: 0,
      log: []
    },
    content: [],
    coupons: [],
    modify: 0,
    printCount: 0,
    source: "POS",
    status: 1
  },
  instance: null,
  archivedOrder: null,
  item: null,
  sides: [],
  choiceSetTarget: null,
  lastActionTime: Date.now()
};
const mutations = {
  [types.RESET_MENU](state) {
    state.order = {
      _id: ObjectId(),
      customer: {},
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
        rounding: 0,
        remain: 0,
        log: []
      },
      content: [],
      coupons: [],
      modify: 0,
      printCount: 0,
      date: today(),
      source: "POS",
      status: 1,
      type: ""
    };
    state.item = null;
    state.instance = null;
    state.choiceSetTarget = null;
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
  [types.PUSH_TO_ORDER](state, item) {
    state.order.content.push(item);
    state.item = state.order.content.last();
  },
  [types.ADD_TO_ORDER](state, { item, autoStack }) {
    //remove necessary params
    delete item.clickable;
    delete item.like;
    delete item.disable;

    Object.assign(item, {
      unique: String().random(),
      print: false,
      pending: false,
      void: false,
      qty: item.qty || 1,
      choiceSet: Array.isArray(item.choiceSet) ? item.choiceSet : [],
      side: item.side ? item.side : {},
      single: parseFloat(item.price[0]),
      total: item.hasOwnProperty("total")
        ? item.total
        : item.price[0].toFixed(2)
    });

    if (state.item) {
      //item qty auto stack function

      if (autoStack
        && item._id === state.item._id && !item.temporary
        && item.option.length === 0 && state.item.choiceSet.length === 0) {
        state.item.total = (++state.item.qty * state.item.single).toFixed(2);
        return;
      }

      const insert = state.order.content.findIndex(item => item === state.item) + 1;
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
  [types.SPLIT_ITEM](state, item) {
    state.item.total = (--state.item.qty * state.item.single).toFixed(2);

    //clone
    const index = state.order.content.findIndex(item => item === state.item) + 1;
    let _item = JSON.parse(JSON.stringify(item));
    _item.qty = 1;
    _item.total = _item.single.toFixed(2);
    _item.unique = String().random();
    state.order.content.splice(index, 0, _item);

    state.item = _item;

    // setTimeout(() =>
    //   document.querySelectorAll("li.item")[index].classList.add("active")
    // );
  },
  [types.ALTER_ITEM_OPTION](state, data) {
    let { item } = state;
    const { index, side, split } = data;
    const {
      disable,
      replace = false,
      ignore = false,
      price,
      extra,
      zhCN,
      usEN
    } = side;

    if (disable || split) return;

    let { single } = item;

    single = parseFloat(price)
      || parseFloat(item.price[index])
      || parseFloat(item.price[0]) + parseFloat(extra)
      || parseFloat(item.price[0]);

    if (item.qty === 1) {
      if (index === item.sideIndex && !data.function) {
        // stack item qty if same side
        item.total = (++item.qty * item.single).toFixed(2)
      } else {
        item.single = single;
        item.total = item.single.toFixed(2);

        if (replace) {
          // replace item name
          Object.assign(item, { zhCN, usEN });
          return;
        }

        if (!ignore) {
          Object.assign(item.side, { zhCN: `[${zhCN}]`, usEN: `[${usEN}]` })
        }
      }
      item.sideIndex = index;
    } else {
      if (index === item.sideIndex) {
        item.total = data.function
          ? (item.qty * item.single).toFixed(2)
          : (++item.qty * item.single).toFixed(2);
      } else {
        item.total = (--item.qty * item.single).toFixed(2);

        // copy item
        let newItem = JSON.parse(JSON.stringify(item));

        Object.assign(newItem, {
          qty: 1,
          single,
          sideIndex: index,
          total: single.toFixed(2),
          unique: String().random(),
          side: { zhCN: `[${zhCN}]`, usEN: `[${usEN}]` },
        });

        //apply style

        const dom = document.querySelector("li.item.active");
        dom && dom.classList.remove("active");

        const itemIndex = state.order.content.findIndex(i => i.unique === item.unique) + 1;
        state.order.content.splice(itemIndex, 0, newItem);

        state.item = newItem;

        setTimeout(() =>
          document.querySelectorAll("li.item")[itemIndex].classList.add("active")
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
  [types.EMPTY_CHOICE_SET](state, target) {
    if (isObject(target)) {
      const key = Object.keys(target)[0];
      const value = Object.values(target)[0];
      state.item.choiceSet = state.item.choiceSet.filter(i => i[key] !== value)
    } else {
      state.item.choiceSet = []
    }
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
  [types.CREATE_ORDER_INSTANCE](state, data) {
    state.instance = JSON.parse(JSON.stringify(data));
  },
  [types.ARCHIVE_ORDER](state, data) {
    state.archivedOrder = JSON.parse(JSON.stringify(data));
  },
  [types.EMPTY_ARCHIVE_ORDER](state) {
    state.archivedOrder = null;
  }
};

export default {
  state,
  mutations
};
