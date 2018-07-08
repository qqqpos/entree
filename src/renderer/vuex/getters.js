export const op = s => s.login.op;
export const app = s => s.initial.app;
export const sync = s => s.initial.sync;
export const time = s => s.initial.time;
export const ring = s => s.initial.ring;
export const device = s => s.initial.device;
export const config = s => s.initial.config;
export const ticket = s => s.initial.ticket;
export const history = s => s.initial.orders;
export const callLog = s => s.initial.callLog;
export const spooler = s => s.initial.spooler;
export const tax = s => s.initial.config.tax;
export const store = s => s.initial.config.store;
export const dinein = s => s.initial.config.dinein;
export const templates = s => s.initial.templates;
export const language = s => s.initial.app.language;
export const station = s => s.initial.config.station;
export const reservation = s => s.initial.reservation;
export const terminals = s => s.initial.config.terminal;
export const password = s => s.login.password;
export const customer = s => s.main.customer;
export const favorites = s => s.main.favorites;
export const item = s => s.menu.item;
export const sides = s => s.menu.sides;
export const order = s => s.menu.order;
export const instance = s => s.menu.instance;
export const choiceSet = s => s.menu.choiceSetTarget;
export const menu = s => s.initial.config.layout.menu;
export const archivedOrder = s => s.menu.archivedOrder;
export const submenu = s => s.initial.config.layout.submenu;
export const actions = s => s.initial.config.layout.action;
export const request = s => s.initial.config.layout.request;
export const isEmptyTicket = s => s.menu.order.content.length === 0;
export const currentTable = s => s.table.currentTable;
export const tables = s => s.initial.config.layout.table;
export const departments = s => s.initial.config.departments || [];
export const authorized = s => s.login.op.role === "Developer" || s.login.op.role === "Owner";
