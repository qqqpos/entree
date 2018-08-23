import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Initialize",
      component: require("../components/bootstrap")
    },
    {
      path: "/login",
      name: "Login",
      component: require("../components/login")
    },
    {
      path: "/Station/:reg",
      name: "Station",
      props: true,
      component: require("../components/station")
    },
    {
      path: "/main",
      component: require("../components/main"),
      children: [
        {
          path: "/",
          name: "Dashboard",
          component: require("../components/dashboard")
        },
        {
          path: "customer",
          component: require("../components/form/index"),
          children: [
            {
              path: "/",
              name: "Information",
              component: require("../components/form/info")
            },
            {
              path: "map",
              name: "Map",
              component: require("../components/form/map")
            },
            {
              path: "tag",
              name: "Tag",
              component: require("../components/form/tag")
            },
            {
              path: "config",
              name: "Config",
              component: require('../components/form/config')
            }
          ]
        },
        {
          path: "table",
          name: "Table",
          component: require("../components/table/index")
        },
        {
          path: "menu",
          name: "Menu",
          component: require("../components/menu/index")
        },
        {
          path: "history",
          name: "History",
          component: require("../components/history/index")
        },
        {
          path: "lock",
          name: "Lock",
          component: require("../components/login")
        },
        {
          path: "list",
          name: "PickupList",
          component: require("../components/pickup")
        },
        {
          path: "setting",
          component: require("../components/setting"),
          children: [
            {
              path: "/",
              name: "Setting.index",
              component: require("../components/setting/index")
            },
            {
              path: "store",
              component: require("../components/setting/store/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.store",
                  component: require("../components/setting/store/store")
                },
                {
                  path: "tax",
                  name: "Setting.store.tax",
                  component: require("../components/setting/store/component/tax")
                },
                {
                  path: "delivery",
                  name: "Setting.store.delivery",
                  component: require("../components/setting/store/component/delivery")
                }, {
                  path: "defaults",
                  name: "Setting.store.defaults",
                  component: require("../components/setting/store/component/defaults")
                },
                {
                  path: "giftcard",
                  name: "Setting.store.giftcard",
                  component: require("../components/setting/store/giftcard")
                },
                {
                  path: "others",
                  name: "Setting.store.others",
                  component: require("../components/setting/store/others")
                },
                {
                  path: "department",
                  name: "Setting.store.department",
                  component: require("../components/setting/store/department")
                },
                {
                  path: "timecard",
                  name: "Setting.store.timecard",
                  component: require("../components/setting/store/component/timecard")
                },
                {
                  path: 'openHour',
                  name: 'Setting.store.openHour',
                  component: require('../components/setting/store/component/openHour')
                },
                {
                  path: "payment",
                  name: "Setting.payment",
                  component: require("../components/setting/store/payment")
                },
                {
                  path: "promotion",
                  name: "Setting.promotion",
                  component: require("../components/setting/store/coupon"),
                },
                {
                  path: "terminal",
                  name: "Setting.terminal",
                  component: require("../components/setting/store/terminal")
                }
              ]
            },
            {
              path: "station",
              component: require("../components/setting/station/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.station",
                  component: require("../components/setting/station/index")
                },
                {
                  path: "device",
                  name: "Setting.station.device",
                  component: require("../components/setting/station/device")
                },
                {
                  path: "interface",
                  name: "Setting.station.interface",
                  component: require("../components/setting/station/setting/interface")
                },
                {
                  path: "cashdrawer",
                  name: "Setting.station.cashdrawer",
                  component: require("../components/setting/station/setting/cashdrawer")
                },
                {
                  path: "printers",
                  name: "Setting.station.printers",
                  component: require("../components/setting/station/setting/printers")
                },
                {
                  path: "callid",
                  name: "Setting.station.callid",
                  component: require("../components/setting/station/setting/callid")
                },
                {
                  path: "customerDisplay",
                  name: "Setting.station.customerDisplay",
                  component: require("../components/setting/station/setting/customerDisplay")
                }
              ]
            },
            {
              path: "menu",
              component: require("../components/setting/menu/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.menu",
                  component: require("../components/setting/menu/menu")
                },
                {
                  path: "request",
                  name: "Setting.request",
                  component: require("../components/setting/menu/request")
                },
                {
                  path: "template",
                  component: require("../components/setting/menu/templateTab"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.template",
                      component: require("../components/setting/menu/template/index")
                    },
                    {
                      path: "config",
                      name: "Setting.template.config",
                      component: require("../components/setting/menu/template/config")
                    },
                    {
                      path: "item",
                      name: "Setting.template.item",
                      component: require("../components/setting/menu/template/item")
                    },
                    {
                      path: "side",
                      name: "Setting.template.side",
                      component: require("../components/setting/menu/template/side")
                    }
                  ]
                },
                {
                  path: "config",
                  name: "Setting.menu.config",
                  component: require("../components/setting/menu/config")
                }
              ]
            },
            {
              path: "dineIn",
              component: require("../components/setting/dineIn/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.dineIn",
                  component: require("../components/setting/dineIn/index")
                },
                {
                  path: "config",
                  name: "Setting.dineIn.config",
                  component: require("../components/setting/dineIn/config")
                },
                {
                  path: "surcharge",
                  name: "Setting.dineIn.surcharge",
                  component: require("../components/setting/dineIn/component/surcharge")
                }
              ]
            },
            {
              path: "online",
              component: require("../components/setting/online/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.online",
                  component: require("../components/setting/online/index")
                }, {
                  path: "config",
                  name: "Setting.online.config",
                  component: require("../components/setting/online/config")
                }, {
                  path: "history",
                  name: "Setting.online.history",
                  component: require("../components/setting/online/history")
                }, {
                  path: "bill",
                  name: "Setting.online.bill",
                  component: require("../components/setting/online/bill")
                }, {
                  path: "marketing",
                  name: "Setting.marketing",
                  component: require("../components/setting/online/marketing/index"),
                  children: [{
                    path: "/",
                    name: "Setting.marketing.feeds",
                    component: require("../components/setting/online/marketing/feeds")
                  }, {
                    path: "sharing",
                    name: "Setting.marketing.sharing",
                    component: require("../components/setting/online/marketing/socialSharing")
                  }, {
                    path: "adWords",
                    name: "Setting.marketing.adWords",
                    component: require("../components/setting/online/marketing/adWords")
                  }]
                }
              ]
            },
            {
              path: "printer",
              component: require("../components/setting/printer/nav"),
              children: [
                {
                  path: "/",
                  component: require("../components/setting/printer/tab"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.printer",
                      component: require("../components/setting/printer/device")
                    },
                    {
                      path: "config/:printer",
                      props: true,
                      name: "Setting.printer.config",
                      component: require("../components/setting/printer/config")
                    },
                    {
                      path: "style/:printer",
                      props: true,
                      name: "Setting.printer.style",
                      component: require("../components/setting/printer/style")
                    },
                    {
                      path: "option/:printer",
                      props: true,
                      name: "Setting.printer.option",
                      component: require("../components/setting/printer/option")
                    },
                    {
                      path: "title/:printer",
                      props: true,
                      name: "Setting.printer.title",
                      component: require("../components/setting/printer/title")
                    },
                    {
                      path: "preview/:printer",
                      props: true,
                      name: "Setting.printer.preview",
                      component: require("../components/setting/printer/preview")
                    }
                  ]
                }
              ]
            },
            {
              path: "operator",
              component: require("../components/setting/operator/nav"),
              children: [
                {
                  path: "/",
                  component: require("../components/setting/operator/operator"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.operator",
                      component: require("../components/setting/operator/empolyee/index")
                    },
                    {
                      path: "config/:operator",
                      props: true,
                      name: "Setting.operator.config",
                      component: require("../components/setting/operator/empolyee/config")
                    },
                    {
                      path: "timecard/:operator",
                      props: true,
                      name: "Setting.operator.timecard",
                      component: require("../components/setting/operator/empolyee/timecard")
                    },
                    {
                      path: "schedule/:operator",
                      props: true,
                      name: "Setting.operator.schedule",
                      component: require("../components/setting/operator/empolyee/schedule")
                    },
                    {
                      path: "access/:operator",
                      props: true,
                      name: "Setting.operator.access",
                      component: require("../components/setting/operator/empolyee/access")
                    },
                    {
                      path: "modify/:operator",
                      props: true,
                      name: "Setting.operator.modify",
                      component: require("../components/setting/operator/empolyee/modify")
                    },
                    {
                      path: "view/:operator",
                      props: true,
                      name: "Setting.operator.view",
                      component: require("../components/setting/operator/empolyee/view")
                    },
                    {
                      path: "permission/:operator",
                      props: true,
                      name: "Setting.operator.permission",
                      component: require("../components/setting/operator/empolyee/permission")
                    }
                  ]
                },
                {
                  path: "payroll",
                  name: "Setting.operator.payroll",
                  component: require("../components/setting/operator/payroll/index")
                },
                {
                  path: "shift",
                  name: "Setting.operator.shift",
                  component: require("../components/setting/operator/shift")
                }
              ]
            },
            {
              path: "database",
              component: require("../components/setting/database/nav"),
              children: [
                {
                  path: "/",
                  component: require("../components/setting/database/tab"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.database",
                      component: require("../components/setting/database/index")
                    },
                    {
                      path: "performance",
                      name: "Setting.database.performance",
                      component: require("../components/setting/database/performance")
                    }
                  ]
                },
                {
                  path: "customer",
                  component: require("../components/setting/database/customerTab"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.database.customer",
                      component: require("../components/setting/database/customer/index")
                    },
                    {
                      path: "profile:/profile",
                      props: true,
                      name: "Setting.database.customer.profile",
                      component: require("../components/setting/database/customer/profile")
                    },
                    {
                      path: "analyze",
                      name: "Setting.database.customer.analyze",
                      component: require("../components/setting/database/customer/analyze")
                    }
                  ]
                },
                {
                  path: "address",
                  component: require("../components/setting/database/addressTab"),
                  children: [
                    {
                      path: "/",
                      name: "Setting.database.address",
                      component: require("../components/setting/database/address/address")
                    },
                    {
                      path: "street/:address",
                      props: true,
                      name: "Setting.database.address.street",
                      component: require("../components/setting/database/address/street")
                    }
                  ]
                },
                {
                  path: "payout",
                  name: "Setting.database.payout",
                  component: require("../components/setting/database/payout")
                },
                {
                  path: "config",
                  name: "Setting.database.config",
                  component: require("../components/setting/database/config")
                }
              ]
            },
            {
              path: "sales",
              component: require("../components/setting/sales/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.sales",
                  component: require("../components/setting/sales/sales")
                },
                {
                  path: "batch",
                  name: "Setting.sales.batch",
                  component: require("../components/setting/sales/batch")
                },
                {
                  path: "cashflow",
                  name: "Setting.sales.cashflow",
                  component: require("../components/setting/sales/cashflow")
                },
                {
                  path: "giftcard",
                  name: "Setting.sales.giftcard",
                  component: require("../components/setting/sales/giftcard")
                },
                {
                  path: "payout",
                  name: "Setting.sales.payout",
                  component: require("../components/setting/sales/payout")
                }
              ]
            },
            {
              path: "chart",
              component: require("../components/setting/chart/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.chart",
                  component: require("../components/setting/chart/sales")
                },
                {
                  path: "hourly",
                  name: 'Setting.chart.hourly',
                  component: require("../components/setting/chart/hourly")
                },
                {
                  path: "source",
                  name: "Setting.chart.source",
                  component: require("../components/setting/chart/source")
                },
                {
                  path: "items",
                  name: "Setting.chart.items",
                  component: require("../components/setting/chart/items")
                }
              ]
            }, {
              path: 'debug',
              component: require("../components/setting/debug/nav"),
              children: [
                {
                  path: "/",
                  name: "Setting.debug",
                  component: require("../components/setting/debug/index")
                }, {
                  path: "tutorial",
                  name: "Setting.tutorial",
                  component: require("../components/setting/debug/tutorial")
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
