import * as types from '../mutation-types'

const state = {
    time: Date.now(),
    sync: Date.now(),
    ring: null,
    app: {},
    menu: {},
    config: {},
    request: {},
    layouts: {},
    orders: [],
    tables: [],
    spooler: [],
    templates: [],
    books: [],
    operator: {},
    callLog: [],
    ticket: {
        number: 1,
        type: ""
    },
    device: {
        callerID: 0,
        scale: false,
        terminal: false,
        poleDisplay: false,
    }
}

const mutations = {
    [types.START_TICK](state, { time, date }) {
        state.time = time;
        if (date !== state.app.date) {
            state.app.newTicket = true;
            state.app.date = date;
            state.operator = {};
            state.orders = [];
            state.order = {};
            state.books = [];
            state.ticket = {
                number: 1,
                type: ""
            }

            // force reset pos when next login
            state.sync = null;
            location.hash = "#/main/lock";
        }
    },
    [types.SET_CONFIG](state, data) {
        state.config = Object.assign({}, state.config, data)
    },
    [types.SET_SYNC](state, sync) {
        state.sync = sync;
    },
    [types.SET_TICKET](state, data) {
        state.ticket = Object.assign({}, state.ticket, data)
    },
    [types.SET_DEVICE](state, data) {
        const value = Object.values(data)[0];
        const key = Object.keys(data)[0];

        if (typeof value === Boolean) {
            state.device = Object.assign({}, state.device, data)
        } else {
            state.device[key] += value;
        }
    },
    [types.SET_TEMPLATES](state, templates) {
        state.templates = templates;
    },
    [types.SET_BOOKS](state, books) {
        state.books = books;
    },
    [types.SET_APP](state, data) {
        state.app = Object.assign({}, state.app, data)
    },
    [types.SET_STATION](state, station) {
        state.config = Object.assign({}, state.config, { station })
    },
    [types.SET_LAYOUTS](state, layouts) {
        state.layouts = layouts//Object.assign({}, state.layouts, layouts);
    },
    [types.SET_MENU](state, menu) {
        const { defaults = {} } = state.config;
        const format = menu ? arrayToObject(menu) : state.menu;

        Object.keys(format).forEach(key => {
            format[key].sort((a, b) => {
                switch (defaults.menuSortBy) {
                    case "ALPHABETICAL":
                        return a.usEN.localeCompare(b.usEN);
                    case "PINYIN":
                        return a.zhCN.localeCompare(b.zhCN, 'zh-Hans-CN', { sensitivity: 'accent' })
                    case "PRICE":
                        return a.price > b.price ? 1 : -1
                    case "ID":
                        return (a.menuID || 0) > (b.menuID || 0) ? 1 : -1
                    default:
                        return a.num > b.num ? 1 : -1
                }
            })
        })

        state.menu = format;
    },
    [types.SET_REQUEST](state, request) {
        const { defaults = {} } = state.config;
        const format = request ? arrayToObject(request) : state.request;

        Object.keys(format).forEach(key => {
            format[key].sort((a, b) => {
                switch (defaults.requestSortBy) {
                    case "ALPHABETICAL":
                        return a.usEN.localeCompare(b.usEN);
                    case "PINYIN":
                        return a.zhCN.localeCompare(b.zhCN, 'zh-Hans-CN', { sensitivity: 'accent' })
                    case "PRICE":
                        return a.price > b.price ? 1 : -1
                    default:
                        return a.num > b.num ? 1 : -1
                }
            })
        })

        state.request = format;
    },
    [types.SET_TABLES](state, tables) {
        state.tables = tables.reduce((obj, table) => {
            obj[table.zone]
                ? obj[table.zone].push(table)
                : obj[table.zone] = [table];
            return obj;
        }, {});
    },
    [types.SET_TODAY_ORDER](state, orders) {
        state.orders = orders;
    },
    [types.ADD_SPOOLER](state, data) {
        data.order.print = false;

        state.spooler.push(data);
        state.spooler.sort((a, b) => (a.schedule - b.schedule))
    },
    [types.REMOVE_SPOOLER](state, index) {
        state.spooler.splice(index, 1)
    },
    [types.SET_OPERATOR](state, operator) {
        state.operator = operator ? Object.assign(state.operator, operator) : {};
    },
    [types.PHONE_RING](state, data) {
        if (data) {
            let { line, forward, phone, name } = data;
            phone = /^1/.test(phone) ? String(phone).slice(1) : String(phone);
            name = name && name.length > 3 ? name : "";

            state.ring = { line, forward, phone, name };
        } else {
            state.ring = null;
        }
    },
    [types.UPSERT_INVOICE](state, invoice) {
        if (invoice.date === today()) {
            const index = state.orders.findIndex(ticket => ticket._id === invoice._id);
            index === -1 ? state.orders.unshift(invoice) : state.orders.splice(index, 1, invoice);

            state.ticket.number = state.orders[0].number + 1;
        }
    },
    [types.UPDATE_TABLE](state, table) {
        const { _id, zone } = table;
        const index = state.tables[zone].findIndex(t => t._id === _id);

        index !== -1 && state.tables[zone].splice(index, 1, table);
    },
    [types.REPLACE_TABLE](state, table) {
        const { _id, zone } = table;

        if (state.tables[zone]) {
            const index = state.tables[zone].findIndex(table => table._id === _id);

            index !== -1
                ? state.tables[zone].splice(index, 1, table)
                : state.tables[zone].push(table);

        } else {
            state.tables[zone] = [table];
        }

    },
    [types.REMOVE_TABLE](state, table) {
        const { _id, zone } = table;
        const index = state.tables[zone].findIndex(t => t._id === _id);

        Object.assign(table, {
            _id: null,
            feature: [],
            invoice: [],
            name: "",
            server: null,
            session: null,
            time: null,
            shape: "",
            status: 0
        });

        index !== -1 && state.tables[zone].splice(index, 1, table);
    },
    // new update methods
    [types.UPDATE_MENU_ITEM](state, item) {
        const { _id, category } = item;

        if (!state.menu.hasOwnProperty(category))
            state.menu[category] = [];

        const index = state.menu[category].findIndex(i => i._id === _id);
        index === -1 ? state.menu[category].push(item) : state.menu[category].splice(index, 1, item);
    },
    [types.REMOVE_MENU_ITEM](state, { _id, category }) {
        const index = state.menu[category].findIndex(i => i._id === _id);
        index !== -1 && state.menu[category].splice(index, 1);
    },
    [types.UPDATE_MENU_CATEGORY](state, { category, items, index }) {
        state.layouts.menu.splice(index, 1, category);

        const group = arrayToObject(items);
        Object.keys(group).forEach(category => {
            state.menu[category] = group[category];
        });

        // remove unused category
        // watch out for memory leak

        // let categories = new Set();
        // state.layouts.menu.forEach(category => {
        //     categories.add(...category.contain)
        // });

        // categories = Array.from(categories);

        // // Object.keys(state.menu).forEach(category => {
        // //     if (!categories.includes(category))
        // //         delete state.menu[category];
        // // });
        // console.log(state.menu,categories)
    },
    [types.UPDATE_REQUEST_CATEGORY](state, { category, items, index }) {
        state.layouts.request.splice(index, 1, category);

        const group = arrayToObject(items);
        Object.keys(group).forEach(category => {
            state.request[category] = group[category];
        });
    },
    [types.UPDATE_REQUEST_ACTION](state, { action, index }) {
        state.layouts.action.splice(index, 1, action)
    },
    [types.UPDATE_REQUEST_ITEM](state, item) {
        const { _id, category } = item;
        const index = state.request[category].findIndex(i => i._id === _id);

        index === -1 ? state.request[category].push(item) : state.request[category].splice(index, 1, item);
    },
    [types.REMOVE_REQUEST_ITEM](state, item) {
        const { _id, category } = item;
        const index = state.request[category].findIndex(i => i._id === _id);
        index !== -1 && state.request[category].splice(index, 1);
    },
    [types.UPDATE_SECTION_TABLES](state, { tables, zone }) {
        state.tables[zone] = tables;
    },
    [types.REMOVE_TABLE_SECTION](state, zone) {
        const index = state.layouts.table.findIndex(section => section.zone === zone);

        if (index !== -1) {
            state.layouts.table.splice(index, 1);
            state.tables = state.tables.filter(table => table.zone === zone)
        }
    },
    [types.NEW_PHONE_CALL](state, data) {
        state.callLog.unshift(data);
        state.callLog = state.callLog.slice(0, 10);
    },
}

export default {
    state,
    mutations
}

function arrayToObject(array) {
    return (array || []).reduce((obj, item) => {
        obj[item.category]
            ? obj[item.category].push(item)
            : obj[item.category] = [item];
        return obj;
    }, {});
}