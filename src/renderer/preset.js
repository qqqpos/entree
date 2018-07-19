var Preset = function () {
  this.station = function (mac, username) {
    return {
      mac,
      username,
      alias: "",
      wol: false,
      terminal: "",
      customerDisplay: {
        poleDisplay: {
          enable: false,
          top: "",
          bot: "",
          port: "",
          animation: false
        },
        ledDisplay: {
          enable: false,
          gallery: "",
          duration: 5
        }
      },
      scale: {
        enable: false,
        port: 'COM1'
      },
      callid: {
        enable: false,
        port: 'COM3',
        command: ""
      },
      receipt: "",
      printers: [],
      cashDrawer: {
        enable: false,
        name: "",
        bind: "",
        cashFlowCtrl: false,
        initialAmount: ""
      },
      autoLock: {
        enable: false,
        timeout: 0,
        done: false
      },
      receiveOnlineOrder: false,
      interface: [{
        "icon": "fa-user",
        "head": "外等",
        "subhead": "Walk In",
        "route": "order",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-phone",
        "head": "来取",
        "subhead": "Pick Up",
        "route": "pickup",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-car",
        "head": "送餐",
        "subhead": "Delivery",
        "route": "delivery",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-utensils",
        "head": "堂吃",
        "subhead": "Dine In",
        "route": "table",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-list",
        "head": "历史",
        "subhead": "History",
        "route": "history",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-inbox",
        "head": "钱机",
        "subhead": "Cash Drawer",
        "route": "cashDrawer",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-cog",
        "head": "设置",
        "subhead": "Setting",
        "route": "setting",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-lock",
        "head": "锁定",
        "subhead": "Lock",
        "route": "lock",
        "password": false,
        "enable": true
      }]
    }
  };
  this.printer = function (type) {
    return {
      type: type || 'regular',
      print: ["WALK_IN", "PICK_UP", "DELIVERY", "DINE_IN", "BAR", "BUFFET", "HIBACHI", "SALES", "TO_GO"],
      reprint: [],
      title: {
        "PICK_UP": "PICK UP",
        "WALK_IN": "WALK IN",
        "DELIVERY": "DELIVERY",
        "PRE_PAYMENT": "PRE PAYMENT",
        "RECEIPT": "RECEIPT",
        "DINE_IN": "DINE IN",
        "HIBACHI": "HIBACHI",
        "BUFFET": "BUFFET",
        "SALES": "SALES",
        "TO_GO": "TO GO",
        "BAR": "BAR"
      },
      control: {
        buzzer: false,
        categorize: false,
        prioritize: false,
        mode: "normal",
        footer: {
          ticketNumber: false,
          tableName: false,
          jobTime: false,
          tradeMark: false,
          geo: false,
          content: [
            "Thank You Very Much"
          ]
        }
      },
      layout: {
        contact: true,
        title: true,
        customer: true,
        payment: true,
        languages: [{
          ref: "zhCN",
          enable: true,
          fontFamily: "QingYuan",
          fontSize: "21",
          lineHeight: 1,
          subFontSize: 0.8,
          price: true,
          id: false
        }, {
          ref: "usEN",
          enable: true,
          fontFamily: "Roboto Condensed",
          fontSize: "21",
          lineHeight: 1,
          subFontSize: 0.8,
          price: true,
          id: false
        }]
      }
    }
  };
  this.item = function () {
    return {
      _id: undefined,
      zhCN: "",
      usEN: "",
      menuID: "",
      price: [0],
      prices: {},
      option: [],
      category: "",
      spicy: false,
      manual: true,
      num: 0,
      priority: 0,
      stock: 0,
      commission: {
        enable: false,
        percentage: false,
        value: 0
      },
      taxClass: null,
      disable: false,
      temporary: false,
      marketPrice: false,
      weightItem: {
        enable: false,
        unit: "lbs",
        value: 0
      },
      preset: [],
      printer: {}
    }
  };
  this.customer = function () {
    return {
      phone: "",
      extension: "",
      address: "",
      city: "",
      name: "",
      note: "",
      duration: "",
      distance: "",
      direction: "",
      coordinate: [],
      firstDate: Date.now(),
      lastDate: Date.now(),
      dob: "",
      email: "",
      carrier: "",
      orderCount: 0,
      orderAmount: 0,
      callCount: 0,
      cancelCount: 0,
      cancelAmount: 0,
      favorite: [],
      allergy: [],
      tags: [],
      profiles: [],
      creditCard: []
    }
  };
  this.operator = function (name, role, pin, wage) {
    let access = [], modify = [], view = [], permission = [], cashCtrl = "disable";
    switch (role) {
      case "Manager":
        access = ["setting", "cashdrawer", "report", "terminal", "history", "exit"];
        view = ["summary", "invoices", "tables"];
        modify = ["price", "item", "order", "table", "driver", "discount", "tip", "void", "transaction"];
        permission = ["giftcard", "payout", "timecard", "batch", "reprint", "ledger"];
        cashCtrl = "enable";
        break;
      case "Cashier":
        access = ["cashdrawer", "terminal", "history", "exit"];
        view = ["summary", "invoices", "tables"];
        modify = ["price", "item", "order", "table", "driver", "discount", "tip", "void", "transaction"];
        permission = ["payout", "batch", "payout"];
        cashCtrl = "enable";
        break;
      case "Waitstaff":
        access = ["setting", "cashdrawer", "history"];
        view = ["summary", "invoices", "tables"];
        modify = ["price", "item", "order", "table", "driver", "discount", "tip", "transaction"];
        cashCtrl = "enable";
        break;
      case "Bartender":
        access = ["cashdrawer", "history"];
        view = ["tables"];
        modify = ["item", "order", "table", "discount", "tip"];
        cashCtrl = "enable";
        break;
    }

    return {
      name,
      role,
      pin,
      wage,
      language: 'usEN',
      timecard: false,
      cashCtrl,
      access,
      modify,
      view,
      permission
    }
  };
  this.giftCard = function (number, seller, amount, bonus) {
    return {
      _id: ObjectId().toString(),
      number,
      seller,
      customer: "",
      balance: amount,
      activation: Date.now(),
      activity: [{
        date: today(),
        time: Date.now(),
        amount: amount,
        balance: amount,
        bonus: bonus || 0,
        type: 'ACTIVATION',
        op: seller
      }]
    }
  };
}

module.exports = new Preset();