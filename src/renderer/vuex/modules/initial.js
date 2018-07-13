import * as types from '../mutation-types'

const state = {
    app: {},
    config: {},
    layout: {},
    orders: [],
    spooler: [],
    templates: [],
    books: [],
    ticket: {
        number: 1,
        type: ""
    },
    device: {
        callid: false,
        scale: false,
        terminal: false,
        poleDisplay: false,
    }
}

const mutations = {
    [types.START_TICK](state, tick) {
        state.time = tick.time;
        if (tick.date !== state.app.date) {
            state.app.date = tick.date;
            state.orders = [];
            state.ticket = {
                number: 1,
                type: ""
            }
        }
    },
    [types.SET_CONFIG](state, data) {
        state.config = Object.assign({}, state.config, data)
    },
    [types.SET_TICKET](state, data) {
        state.ticket = Object.assign({}, state.ticket, data)
    },
    [types.SET_DEVICE](state, data) {
        state.device = Object.assign({}, state.device, data)
    },
    [types.SET_TEMPLATES](state, templates) {
        state.templates = templates;
    },
    [types.SET_BOOK](state, books) {
        state.books = books
    },
    [types.SET_APP](state, data) {
        state.app = Object.assign({}, state.app, data)
    },
    [types.SET_STATION](state, station) {
        state.config = Object.assign({}, state.config, { station })
    },
    [types.SET_LAYOUT](state, layout) {
        state.layout = layout;
    },
    [types.SET_MENU](state, menu) {
        //state.config.layout.menu = flatten(state.config.layout.menu, data, true, alphabetical);
        state.layout.menu = flatten(menu)
    },
    [types.SET_REQUEST](state, request) {
        state.request = flatten(request)
    },
    [types.SET_TABLE](state, table) {
        state.layout.table = table
    },
    [types.SET_TODAY_ORDER](state, orders) {
        state.orders = orders
    },
    [types.ADD_SPOOLER](state, data) {
        state.spooler.push(data);
        state.spooler.sort((a, b) => (a.schedule - b.schedule))
    },
    [types.REMOVE_SPOOLER](state, index) {
        state.spooler.splice(index, 1)
    },
    [types.PHONE_RING](state, data) {
        if (data) {
            let { phone, name } = data;
            phone = /^1/.test(phone) ? String(phone).slice(1) : String(phone);
            name = name && name.length > 3 ? name : "";

            state.ring = { phone, name };
        } else {
            state.ring = null;
        }
    },
    [types.UPSERT_INVOICE](state, invoice) {
        const index = state.orders.findIndex(ticket => ticket._id === invoice._id);
        index === -1 ? state.orders.unshift(invoice) : state.orders.splice(index, 1, invoice);
    },
















    

    //update stuff
    [types.UPDATE_TABLE_STATUS](state, table) {
        if (!table) return;

        const zone = table.zone;
        let tables = state.config.layout.table;
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].zone === zone) {
                let items = tables[i].item;
                for (let i = 0; i < items.length; i++) {
                    if (items[i]._id === table._id) {
                        items[i] = table;
                        break;
                    }
                }
                break;
            }
        }
        state.config.layout.table.splice();
    },
    [types.UPDATE_MENU_CATEGORY](state, { category, items, index }) {
        category = flatten(category, items)[0];
        state.config.layout.menu.splice(index, 1, category);
    },
    [types.REPLACE_MENU](state, data) {
        state.config.layout.menu = data;
    },
    [types.UPDATE_MENU_ITEM](state, { item, sequence }) {
        const [g, s, i] = sequence;
        item.clickable = true;
        state.config.layout.menu[g]['item'][s].splice(i, 1, item);
    },
    [types.REMOVE_MENU_ITEM](state, [g, s, i]) {
        const item = { zhCN: "", usEN: "", clickable: false, category: "" };

        state.config.layout.menu[g]['item'][s].splice(i, 1);
        state.config.layout.menu[g]['item'][s].push(item);
    },
    [types.REPLACE_REQUEST_ITEM](state, { index, items }) {
        state.config.layout.request[index].item = items;
    },
    [types.UPDATE_REQUEST_CATEGORY](state, { category, items, index }) {
        category = flatten(category, items, false)[0];
        state.config.layout.request.splice(index, 1, category);
    },
    [types.UPDATE_REQUEST_ITEM](state, { categoryIndex, groupIndex, index, item }) {
        item.clickable = true;
        state.config.layout.request[categoryIndex]['item'][groupIndex].splice(index, 1, item)
    },
    [types.UPDATE_REQUEST_ACTION](state, { action, index }) {
        state.config.layout.action.splice(index, 1, action)
    },
    [types.REMOVE_REQUEST_ITEM](state, { categoryIndex, groupIndex, index }) {
        const item = { zhCN: "", usEN: "", clickable: false, category: "NA" }

        state.config.layout.request[categoryIndex]['item'][groupIndex].splice(index, 1);
        state.config.layout.request[categoryIndex]['item'][groupIndex].push(item)
    },
    [types.NEW_PHONE_CALL](state, data) {
        state.callLog.unshift(data);
        state.callLog = state.callLog.slice(0, 10);
    },
    [types.SET_PRINTER](state, data) {
        state.config.printer = Object.assign({}, state.config.printer, data);
    },
    [types.UPDATE_TABLE_SECTION](state, data) {
        let { section, index } = data;
        state.config.layout.table.splice(index, 1, section);
    },
    [types.SET_TABLE_SORT](state, data) {
        let { tables, index } = data;
        state.config.layout.table[index].item = tables;
    },
    [types.REPLACE_TABLE](state, { table, index, section }) {
        state.config.layout.table[section].item.splice(index, 1, table);
    },
    [types.REMOVE_TABLE](state, { section, index }) {
        let table = state.config.layout.table[section].item[index];

        Object.assign(table, { name: '', shape: '' });
        state.config.layout.table[section].item.splice(index, 1, table);
    },
    [types.NEW_RESERVATION](state, data) {
        state.reservation.push(data)
    },
    [types.UPDATE_RESERVATION](state, data) {
        let { _id } = data;
        let index = state.reservation.findIndex(reservation => reservation._id === _id);
        state.reservation.splice(index, 1, data)

        state.reservation = state.reservation.filter(reserved => reserved.status !== 2)
    }
}

export default {
    state,
    mutations
}

const flatten = function (target) {
    return target
}