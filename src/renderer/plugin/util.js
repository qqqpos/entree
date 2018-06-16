export default {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        exitComponent() {
          this.component = null;
          this.componentData = null;
        }
      }
    });

    Vue.prototype.approval = function (credential, permit) {
      let approve = false;

      try {
        approve =
          this.op.role === "Developer" || this.op.role === "Owner"
            ? true
            : credential.includes(permit);
      } catch (error) {
        this.$log({
          eventID: 9000,
          type: "bug",
          source: "plugin/util.js [function] approval",
          note: `Operator seems does not have ${permit} setting. \nTo fix this issue, please add ${permit}:[] to profile.`
        });
      }
      return approve;
    };

    Vue.prototype.$log = function (event) {
      this.$socket.emit("[SYS] LOG", event);
    };

    Vue.prototype.$open = function (component, args) {
      return new Promise((resolve, reject) => {
        this.componentData = Object.assign({}, { resolve, reject }, args);
        this.component = component;
      })
        .then(this.exitComponent)
        .catch(this.exitComponent);
    };

    Vue.prototype.$dialog = function (args) {
      return new Promise((resolve, reject) => {
        this.componentData = {
          type: args.type || "alert",
          title: args.title,
          msg: args.msg,
          timeout: args.hasOwnProperty("timeout")
            ? {
              duration: args.timeout.duration || 15000,
              fn: args.timeout.fn === "resolve" ? resolve : reject
            }
            : null,
          buttons: [],
          resolve,
          reject
        };
        args.hasOwnProperty("buttons")
          ? args.buttons.forEach(button => {
            this.componentData.buttons.push({
              text: button.text,
              fn: button.fn === "resolve" ? resolve : reject,
              load: !!button.load
            });
          })
          : (this.componentData.buttons = [
            { text: "button.cancel", fn: reject, load: false },
            { text: "button.confirm", fn: resolve, load: false }
          ]);
        this.component = "dialoger";
      });
    };

    Vue.prototype.$checkPermission = function (credential, permit) {
      let approve = false;

      const { name, role, restrict } = this.op;
      const permission = this.op[credential];

      approve =
        role === "Developer" || role === "Owner"
          ? true
          : permission.includes(permit);

      return new Promise((authorized, unauthorized) => {
        if (approve) {
          authorized();
        } else if (restrict) {
          this.$accessDenied();
          unauthorized();
        } else {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject, grant: true };
            this.component = "unlock";
          })
            .then(operator => {
              let _approve = false;
              const _permission = operator[credential];
              _approve =
                operator.role === "Developer" || operator.role === "Owner"
                  ? true
                  : _permission.includes(permit);

              if (_approve) {
                this.exitComponent();
                authorized();
                this.$log({
                  eventID: 8000,
                  type: "success",
                  source: "plugin/dialog.js",
                  note: `${name} has inherited ${permit} permission from ${
                    operator.name
                    }`
                });
              } else {
                this.$accessDenied();
                unauthorized();
                const note = `${name} attempted to grant permission from ${
                  operator.name
                  } but neither has ${permit} permission.`;
                this.$log({
                  eventID: 8001,
                  type: "failure",
                  source: "plugin/dialog.js",
                  note
                });
              }
            })
            .catch(() => {
              this.$accessDenied();
              unauthorized();
            });
        }
      });
    };

    Vue.prototype.$accessDenied = function (prompt) {
      prompt = prompt || {
        type: "warning",
        title: "dialog.permissionDenied",
        msg: "dialog.permissionDeniedTip",
        timeout: { duration: 10000, fn: "reject" },
        buttons: [{ text: "button.confirm", fn: "reject" }]
      };

      this.$dialog(prompt).catch(this.exitComponent);
    };

    Vue.prototype.$minifyCustomer = ({
      _id = undefined,
      phone,
      extension,
      address,
      city,
      name,
      note,
      duration,
      distance,
      direction,
      coordinate,
      zipCode }) => ({
        _id,
        phone,
        extension,
        address,
        city,
        name,
        note,
        duration,
        distance,
        direction,
        coordinate,
        zipCode
      });

    // Vue.prototype.syncChange = function (object, onChange) {
    //     const handler = {
    //         get(target, property, receiver) {
    //             try {
    //                 return new Proxy(target[property], handler)
    //             } catch (e) {
    //                 return Reflect.get(target, property, receiver)
    //             }
    //         },
    //         defineProperty(target, property, descriptor) {
    //             onChange();
    //             return Reflect.defineProperty(target, property, descriptor);
    //         },
    //         deleteProperty(target, property) {
    //             onChange();
    //             return Reflect.deleteProperty(target, property);
    //         }
    //     };
    //     return new Proxy(object, handler)
    // }

    Vue.prototype.$calculatePayment = function (order, params = {}) {
      const {
        selfAssign = true,
        callback = false
      } = params;

      const {
        type,
        guest,
        coupons,
        taxFree = false,
        deliveryFree = false,
        gratuityFree = false,
        plasticBag = 1
      } = order;

      const { enable, rules } = this.dinein.surcharge;

      let delivery = 0;

      if (type === "DELIVERY" && !deliveryFree) {
        if (this.store.deliver.charge)
          delivery = parseFloat(this.store.deliver.baseFee);

        if (this.store.deliver.surcharge) {
          const addressDistance = order.customer.distance || this.customer.distance;
          const duration = parseFloat(addressDistance.replace(/[^\d.]/g, ""));
          const distance = isNumber(duration) ? duration : 0;
          const surcharge = this.store.deliver.rules
            .sort((a, b) => a.distance < b.distance)
            .find(rule => rule.distance < distance);

          if (surcharge && isNumber(surcharge))
            delivery += parseFloat(surcharge.fee);
        }

        if (order.hasOwnProperty("deliveryFee"))
          delivery = order.deliveryFee;
      }

      let { tip, gratuity, paid, rounding = 0, log } = order.payment;

      let subtotal = 0,
        tax = 0,
        discount = 0;

      order.content.forEach(item => {
        if (item.void) return;

        const single = parseFloat(item.single);
        const qty = item.qty || 1;
        const taxClass = this.tax.class[item.taxClass];

        let amount = toFixed(single * qty, 2);

        item.choiceSet.forEach(set => {
          const _price = parseFloat(set.single);

          if (_price !== 0) {
            const _qty = set.qty || 1;
            const _total = _qty * _price;
            amount = toFixed(amount + _total, 2);
          }
        });

        subtotal = toFixed(subtotal + amount, 2);

        if (!taxFree && taxClass.apply[type])
          (tax += taxClass.rate / 100 * amount), 2;
      });

      if (this.tax.deliveryTax) {
        /*
            is Delivery fee taxable?
            Find out default tax rate and apply to delivery charge
        */

        let taxRate = 0;
        Object.keys(this.tax.class).forEach(type => {
          this.tax.class[type].default === true &&
            (taxRate = this.tax.class[type].rate);
        });
        /**
         * Tax apply Before Discount (For Example: 10% Tax Rate, 20% Discount)
         *
         * Subtotal: 10.00
         * Tax:       1.00
         * Discount:  2.00
         * Total:     9.00
         * ------------------------------------------------------------------
         **/
        tax += delivery * taxRate / 100;
      }

      let plasticTax = 0;
      if (this.tax.plasticPenalty) {
        //calculate plastic bag penalty
        const fine = isNumber(this.tax.plasticCharge)
          ? parseFloat(this.tax.plasticCharge)
          : 0.5;

        plasticTax = toFixed(plasticBag * fine, 2);
      }

      if (type === "DINE_IN" && !gratuityFree) {
        if (enable) {
          //find rule
          try {
            const { fee, percentage } = rules
              .sort((a, b) => a.guest < b.guest)
              .find(r => guest >= r.guest);
            gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
          } catch (e) { }
        }

        if (this.order.hasOwnProperty("gratuityPercentage")) {
          gratuity = toFixed(subtotal * this.order.gratuityPercentage / 100, 2);
        } else if (this.order.hasOwnProperty("gratuityFee")) {
          gratuity = this.order.gratuityFee;
        }
      } else {
        gratuity = 0;
      }

      if (coupons && coupons.length > 0) {
        let offer = 0;
        coupons.forEach(coupon => {
          const { reference } = coupon;

          switch (coupon.type) {
            // 'rebate':        '满减券',
            // 'giveaway':      '礼物券',
            // 'voucher':       '现金券',
            // 'discount':      '折扣券',
            case "rebate":
              offer += coupon.discount;
              break;
            case "voucher":
              offer += coupon.discount;
              break;
            case "discount":
              switch (coupon.apply) {
                case "category":
                  let _offer = 0;
                  order.content.forEach(item => {
                    if (reference.includes(item.category)) {
                      _offer += coupon.discount / 100 * item.single * item.qty;
                    }
                  });
                  offer += _offer;
                  break;
                case "item":
                  break;
                default:
                  offer += coupon.discount / 100 * subtotal;
              }
              break;
          }
        });

        discount += offer;
      }

      const total = subtotal + plasticTax + toFixed(tax, 2);
      const due = Math.max(0, total + delivery - discount)
        .toPrecision(12)
        .toFloat();
      const grandTotal = toFixed((due + gratuity) * 100, 2);

      rounding = this.$rounding(grandTotal);

      const balance = due + gratuity + rounding;
      const remain = balance - paid;
      const payment = {
        subtotal: toFixed(subtotal, 2),
        tax: toFixed(tax, 2),
        plasticTax: toFixed(plasticTax, 2),
        total: toFixed(total, 2),
        discount: toFixed(discount, 2),
        due: toFixed(due, 2),
        balance: toFixed(balance, 2),
        paid: toFixed(paid, 2),
        remain: toFixed(remain, 2),
        tip: toFixed(tip, 2),
        gratuity: toFixed(gratuity, 2),
        delivery: toFixed(delivery, 2),
        rounding: toFixed(rounding, 2),
        log
      }

      selfAssign && Object.assign(order, { payment });
      if (callback) return payment;
    };

    Vue.prototype.$rounding = function (value) {
      let rounding = 0;

      switch (this.store.rounding) {
        case "quarter":
          rounding = toFixed((25 - value % 25) / 100, 2);
          rounding = rounding === 0.25 ? 0 : rounding;
          break;
        case "roundUp":
          const near = Math.ceil(value / 5) * 5;
          rounding = toFixed((near - value) / 100, 2);
          rounding = rounding === 0.05 ? 0 : rounding;
          break;
        case "roundDown":
          rounding = -toFixed((value % 5) / 100, 2);
          break;
        case "auto":
          if (value % 5 < 3) {
            rounding =
              value % 5 === 0
                ? 0
                : -toFixed((value - Math.floor(value / 5) * 5) / 100, 2);
          } else {
            rounding = toFixed((Math.ceil(value / 5) * 5 - value) / 100, 2);
          }
          break;
        default:
          rounding = 0;
      }

      return rounding
    }

    //polyfill

    Array.prototype.last = function () {
      return this[this.length - 1] || null;
    };

    Array.prototype.remove = function (object) {
      for (let i = 0; i < this.length; i++) {
        if (this[i] === object) {
          this.splice(i, 1);
          break;
        }
      }
    };

    Array.prototype.getLastInsertIndex = function (array) {
      let index = 0;
      for (let i = 0; i < this.length; i++) {
        if (this[i].key === array.key) {
          index = i;
        }
      }
      return index + 1;
    };

    String.prototype.toFixed = function (places) {
      return isNumber(this) ? parseFloat(this).toFixed(places) : "0.00";
    };

    String.prototype.toCapitalCase = function () {
      return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    String.prototype.toFloat = function () {
      return parseFloat(this);
    };

    String.prototype.random = function (length = 4) {
      return Math.random()
        .toString(36)
        .replace(/[^a-zA-Z]+/g, "")
        .substr(0, length);
    };

    window.util = {
      chunk(collection, size = 2) {
        let result = [];
        const length = Math.ceil(collection.length / size);

        for (let x = 0; x < length; x++) {
          const start = x * size;
          const end = start + size;
          result.push(collection.slice(start, end));
        }
        return result;
      },
      flatten(array, result = []) {
        const length = array.length;
        for (let i = 0; i < length; i++) {
          let value = array[i];

          Array.isArray(value)
            ? util.flatten(value, result)
            : result.push(value);
        }
        return result;
      },
      formatAddress(address) {
        //\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|ln|lane|drive|way|court|plaza|square|run|parkway|point|pike|pkwy|square|driveway|trace|park|terrace|circle|loop|blvd|broadway|trail|trl|\w)[^#]?/i
        const reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|ln|lane|drive|way|court|plaza|square|run|parkway|point|pike|pkwy|square|driveway|trace|park|terrace|circle|loop|blvd|broadway|trail|trl)[^#]/i;
        const match = address.match(reg);

        return match ? match[0] : false;
      }
    };

    window.clone = target =>
      Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    window.toFixed = (number, fractionSize) =>
      +(
        Math.round(+(number.toString() + "e" + fractionSize)).toString() +
        "e" +
        -fractionSize
      );
    window.ObjectId = (
      m = Math,
      d = Date,
      h = 16,
      s = s => m.floor(s).toString(h)
    ) =>
      s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h));
    window.isObject = obj => obj === Object(obj);
    window.isNumber = n => /^-?[\d.]+(?:e-?\d+)?$/.test(n);
    window.today = function (offset = 0) {
      let d = new Date();
      d = d.setHours(d.getHours() - 4 + offset * 24);
      d = new Date(d);
      return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
        "0" + d.getDate()
      ).slice(-2)}`;
    };
    window.line = function (line1, line2) {
      const f = function (data) {
        if (typeof data === "string") {
          const i = Math.floor(Math.abs(20 - data.length) / 2);
          return (" ".repeat(i) + data + " ".repeat(i + 10)).slice(0, 20);
        } else {
          const string = data[0];
          const amount = isNumber(data[1])
            ? data[1] > 0 ? "$ " + data[1] : "-$ " + data[1]
            : data[1];

          let i = 20 - (string + amount).length;
          i < 0 && (i = 0);
          return (string + " ".repeat(i) + amount).slice(0, 20);
        }
      };
      return f(line1) + f(line2);
    };
    window.toggleClass = function (target, className) {
      let dom =
        target instanceof HTMLElement ? target : document.querySelector(target);
      dom.className.includes(className)
        ? dom.classList.remove(className)
        : dom.classList.add(className);
    };
  }
};
