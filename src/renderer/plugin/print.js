import { Ticket, Preview } from "./layout/ticket";
import Creditcard from "./layout/creditcard";
import Giftcard from "./layout/giftcard";
import Timecard from "./layout/timecard";
import BatchReport from "./layout/batch";
import Hibachi from "./layout/hibachi";
import Reserve from "./layout/reserve";
import CashOut from "./layout/cashout";
import CashIn from "./layout/cashin";
import Report from "./layout/report";

const Printer = function(plugin, config, station) {
  this.plugin = plugin;
  this.config = config.store;
  this.station = station;
  this.setting = config.printers;
  this.devices = station
    ? station.printers || Object.keys(config.printers)
    : Object.keys(config.printers);
  this.target = "Receipt";

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
  this.initial = function(plugin, config, station) {
    this.plugin = plugin;
    this.config = config.store;
    this.station = station;
    this.setting = config.printers;
    this.devices = station.printers || Object.keys(config.printers);
  };

  this.setTarget = function(name) {
    this.target = name || this.station.receipt || "cashier";
    return this;
  };

  this.getPrinters = function() {
    let printer = [];
    switch (this.target) {
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

  this.openCashDrawer = function() {
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

  this.buzzer = function(device) {
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

  this.reset = function() {
    this.target = "All";
  };

  this.print = (raw, receipt) => Ticket.bind(this)(raw, receipt);
  this.preview = (printer, ticket) => Preview.bind(this)(printer, ticket);
  this.printReport = data => Report.bind(this)(data);
  this.printHibachi = (printer, order, items) =>
    Hibachi.bind(this)(printer, order, items);
  this.printGiftCard = (title, card, bonus) =>
    Giftcard.bind(this)(title, card, bonus);
  this.printCreditCard = (trans, reprint) =>
    Creditcard.bind(this)(trans, reprint);
  this.printBatchReport = (data, detail) =>
    BatchReport.bind(this)(data, detail);
  this.printTimeCardReport = data => Timecard.bind(this)(data);
  this.printCashInReport = data => CashIn.bind(this)(data);
  this.printCashOutReport = (data, detail) => CashOut.bind(this)(data, detail);
  this.printReserveTicket = data => Reserve.bind(this)(data);
};

export default Printer;
