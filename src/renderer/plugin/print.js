import { Ticket, Preview } from "./layout/ticket";
import Creditcard from "./layout/creditcard";
import Giftcard from "./layout/giftcard";
import Timecard from "./layout/timecard";
import BatchReport from "./layout/batch";
import Hibachi from "./layout/hibachi";
import Reserve from "./layout/reserve";
import Session from "./layout/session";
import CashOut from "./layout/cashout";
import CashIn from "./layout/cashin";
import Report from "./layout/report";
import Label from "./layout/label";

const Printer = function (plugin, config, station) {
  this.plugin = plugin;
  this.config = config.store;
  this.station = station;
  this.setting = config.printers;
  this.devices = station
    ? station.printers || Object.keys(config.printers)
    : Object.keys(config.printers);
  this.target = "All";

  /**
   * Set target printers
   * @param  {string} name       The name of the printer target group
   *
   *           All,     // call all printer to print
   *           Receipt, // only the cashier printer to print
   *           Order,   // All printer but EXCLUDE cashier printer
   *
   * @return
   */
  this.initial = function (plugin, config, station) {
    this.plugin = plugin;
    this.config = config.store;
    this.station = station;
    this.setting = config.printers;
    this.devices = station.printers || Object.keys(config.printers);
  };

  this.setTarget = function (name) {
    this.target = name || this.station.receipt || "cashier";
    return this;
  };

  this.getPrinters = function (target) {
    let printer = [];
    target = target || this.target;

    switch (target) {
      case "All":
      case "Ticket":
        printer = this.devices.filter(device => !/cashier/i.test(device));
        printer.splice(0, 0, this.station.receipt || "cashier");
        break;
      case "Receipt":
        printer = [this.station.receipt || "cashier"];
        break;
      case "Order":
        printer = this.devices.filter(device => !/cashier/i.test(device));
        break;
      default:
        printer = [this.target];
    }
    return printer;
  };

  this.openCashDrawer = function () {
    if (this.station.cashDrawer.enable) {
      this.plugin.PRINT_INIT("Open");
      this.plugin.SET_PRINTER_INDEX(
        this.station.cashDrawer.bind || this.station.receipt
      );
      this.plugin.SEND_PRINT_RAWDATA(
        String.fromCharCode(27) +
        String.fromCharCode(112) +
        String.fromCharCode(48) +
        String.fromCharCode(55) +
        String.fromCharCode(221)
      );
    }
  };

  this.buzzer = function (device) {
    this.plugin.PRINT_INIT("Buzzer");
    this.plugin.SET_PRINTER_INDEX(device);
    this.plugin.SEND_PRINT_RAWDATA(
      String.fromCharCode(27) +
      String.fromCharCode(67) +
      String.fromCharCode(4) +
      String.fromCharCode(2) +
      String.fromCharCode(3)
    );
    return this;
  };

  this.reset = function () {
    this.target = "All";
  };

  const self = this;

  this.print = (raw, receipt,target) => checkStatus().then(() => Ticket.bind(self)(raw, receipt,target));
  this.preview = (printer, ticket) => Preview.bind(self)(printer, ticket);
  this.printReport = data => checkStatus().then(() => Report.bind(self)(data));
  this.printLabel = (printer, order) => checkStatus().then(() => Label.bind(self)(printer, order));
  this.printHibachi = (printer, order, items) => checkStatus().then(() => Hibachi.bind(self)(printer, order, items));
  this.printGiftCard = (title, card, bonus) => checkStatus().then(() => Giftcard.bind(self)(title, card, bonus));
  this.printCreditCard = (trans, config, reprint) => checkStatus().then(() => Creditcard.bind(self)(trans, config, reprint));
  this.printBatchReport = (data, detail) => checkStatus().then(() => BatchReport.bind(self)(data, detail));
  this.printTimecardReport = data => checkStatus().then(() => Timecard.bind(self)(data));
  this.printCashInReport = data => checkStatus().then(() => CashIn.bind(self)(data));
  this.printCashOutReport = (data, detail) => checkStatus().then(() => CashOut.bind(self)(data, detail));
  this.printSessionReport = data => checkStatus().then(() => Session.bind(self)(data));
  this.printReserveTicket = data => checkStatus().then(() => Reserve.bind(self)(data));

  const checkStatus = () =>
    new Promise((ready) => {
      if (this.plugin.webskt.readyState === 1) {
        ready()
      } else {
        const loop = setInterval(() => {
          if (this.plugin.webskt.readyState === 1) {
            clearInterval(loop);
            ready();
          }
        }, 500)
      }
    })

};

export default Printer;
