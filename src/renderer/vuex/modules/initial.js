import * as types from '../mutation-types'

const state = {
    app: {},
    ring: null,
    config: {},
    orders: [],
    callLog: [],
    spooler: [],
    templates: [],
    reservation: [],
    sync: +new Date(),
    time: +new Date(),
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
    [types.SET_TICKET](state, data) {
        state.ticket = Object.assign({}, state.ticket, data)
    },
    [types.SET_DEVICE](state, data) {
        state.device = Object.assign({}, state.device, data)
    },
    [types.SET_CONFIG](state, data) {
        state.config = Object.assign({}, state.config, data)
    },
    [types.SET_TEMPLATES](state, data) {
        state.templates = data;
    },
    [types.SET_RESERVATION](state, data) {
        state.reservation = data;
    },
    [types.SET_APP](state, data) {
        state.app = Object.assign({}, state.app, data)
    },
    [types.SET_STATION](state, station) {
        state.config = Object.assign({}, state.config, { station })
    },
    [types.SET_MENU](state, data) {
        const { alphabetical } = state.config.display;
        state.config.layout.menu = flatten(state.config.layout.menu, data, true, alphabetical);
    },
    [types.SET_SUBMENU](state, data) {
        let submenu = {};
        data = data || []
        data.forEach(item => {
            submenu.hasOwnProperty(item.group) ?
                submenu[item.group].push(item) :
                submenu[item.group] = [item];
        })
        // Object.keys(submenu).forEach(key => {
        //     let group = submenu[key];
        //     let length = group.length;
        //     let align = 6 - length % 3;

        //     align === 6 && (align = 3);
        //     group.sort((a, b) => a.num - b.num);

        //     Array(align).fill().forEach(_ => { group.push({ zhCN: "", usEN: "", clickable: false, group: null }) });
        // })
        state.config.layout.submenu = submenu;
    },
    [types.SET_REQUEST](state, data) {
        state.config.layout.request = flatten(state.config.layout.request, data, false)
    },
    [types.REMOVE_PRINTER](state, data) {
        delete state.config.printer[data];
        state.config.printer.splice();
    },
    [types.SET_TABLE](state, data) {
        let layout = state.config.layout.table;
        state.config.layout.table = layout.map(section => {
            const { zone } = section;
            let seat = Array(56).fill().map(() => ({
                feature: [],
                invoice: [],
                name: "",
                server: null,
                session: null,
                shape: "",
                status: 0,
                time: 0,
                grid: 0,
                zone
            }));

            data.forEach(table => {
                if (table.zone === zone) seat[table.grid] = table;
            });

            section.item = seat;

            return section;
        });
    },
    [types.SET_TEMPORARY_TABLE](state, table) {
        const { zone, grid } = table;
        const index = state.config.layout.table.findIndex(section => section.zone === zone);

        table.status === 0
            ? state.config.layout.table[index].item.splice(grid, 1)
            : state.config.layout.table[index].item.splice(grid, 1, table)
    },
    [types.SET_LASTSYNC](state, time) {
        state.sync = time
    },
    [types.SET_TODAYORDER](state, data) {
        state.orders = data
    },
    [types.ADD_SPOOLER](state, data) {
        state.spooler.push(data);
        state.spooler.sort((a, b) => (a.delay - b.delay))
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
        const item = {zhCN: "", usEN: "",clickable: false, category: "" };

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

function flatten(layout, data, page, sort) {
    let group = {};
    data = data || [];
    data.map(item => {
        !group.hasOwnProperty(item.category) && (group[item.category] = []);
        group[item.category].push(item);
    });
    !Array.isArray(layout) && (layout = [layout]);
    layout.forEach(layer => {
        layer.contain.forEach(item => {
            let items = group[item] || [];

            if (sort && items.length > 0) {
                let hanz = !!items[0].zhCN.match(/[\u3400-\u9FBF]/);

                hanz ?
                    items.sort((a, b) => a.zhCN.localeCompare(b.zhCN, 'zh-Hans-CN', {
                        sensitivity: 'accent'
                    })) :
                    items.sort((a, b) => a.zhCN.localeCompare(b.zhCN));
            }

            let align = 6 - items.length % 3;
            align === 6 && (align = 3);
            Array(align).fill().forEach(_ => {
                items.push({
                    zhCN: "",
                    usEN: "",
                    clickable: false,
                    category: "NA"
                })
            });
            layer.item.push(group[item] || items);
        });
        let length = [].concat.apply([], layer.item).length;
        let last = Math.max(0, layer.item.length - 1);
        page = page ? Math.ceil(length / 33) : 1;
        length = Math.max(0, (33 * page - length));
        for (let i = 0; i < length; i++) {
            layer.item[last] && layer.item[last].push({
                zhCN: "",
                usEN: "",
                clickable: false
            })
        }
    })
    return layout;
}