export const op = s => s.initial.operator;
export const app = s => s.initial.app;
export const time = s => s.initial.time;
export const ring = s => s.initial.ring;
export const books = s => s.initial.books;
export const device = s => s.initial.device;
export const config = s => s.initial.config;
export const ticket = s => s.initial.ticket;
export const history = s => s.initial.orders;
export const callLog = s => s.initial.callLog;
export const spooler = s => s.initial.spooler;

export const tax = s => s.initial.config.tax;
export const store = s => s.initial.config.store;
export const dinein = s => s.initial.config.dinein;

export const language = s => s.initial.app.language;
export const station = s => s.initial.config.station;
export const terminals = s => s.initial.config.terminal;
export const customer = s => s.main.customer;
export const favorites = s => s.main.favorites;

export const item = s => s.menu.item;
export const sides = s => s.menu.sides;
export const order = s => s.menu.order;
export const instance = s => s.menu.instance;
export const choiceSet = s => s.menu.choiceSetTarget;

export const menu = s => s.initial.menu;
export const request = s => s.initial.request;
export const layouts = s => s.initial.layouts;
export const templates = s => s.initial.templates;
export const archivedOrder = s => s.menu.archivedOrder;

export const table = s => s.table.viewTable;
export const tables = s => s.initial.tables;
export const departments = s => s.initial.config.departments || [];
export const isEmptyTicket = s => s.menu.order.content.length === 0;
export const authorized = s => s.initial.operator.role === "Developer" || s.initial.operator.role === "Owner";
