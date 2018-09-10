import { configureRequestOptions } from "builder-util-runtime";

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
        this.$log(`[${this.op.name}] does not have ${permit} setting. \nTo fix this issue, please add ${permit}:[] to profile.`);
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
            const fn = button.fn === "resolve" ? resolve : button.fn === "reject" ? reject : button.fn;
            this.componentData.buttons.push({
              fn,
              text: button.text,
              load: button.load
            });
          })
          : (this.componentData.buttons = [
            { text: "button.cancel", fn: reject, load: false },
            { text: "button.confirm", fn: resolve, load: false }
          ]);
        this.component = "dialogModule";
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
            this.component = "unlockModule";
          })
            .then(operator => {
              let approved = false;
              const permissions = operator[credential];

              approved =
                operator.role === "Developer" || operator.role === "Owner"
                  ? true
                  : permissions.includes(permit);

              if (approved) {
                this.$log(`[${name}] has inherited [${permit}] permission from ${operator.name}`);
                this.exitComponent();
                authorized();
              } else {
                this.$log(`[${name}] tried to inherited permission from ${operator.name} but neither has ${permit} permission.`);
                this.$accessDenied();
                unauthorized();
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
        msg: "dialog.permissionDeniedContactManager",
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
      // private methods
      const getDeliveryCharge = () => {
        const { charge, baseFee, surcharge, rules } = this.store.deliver;
        let delivery = charge ? parseFloat(baseFee) : 0;

        if (surcharge) {
          const addressDistance = order.customer.distance || this.customer.distance;
          const duration = parseFloat(addressDistance) || 0;
          const distance = addressDistance.includes("ft") ? duration / 100 : duration;
          const rule = rules
            .sort((a, b) => a.distance < b.distance)
            .find(rule => rule.distance < distance);

          if (rule && isNumber(rule.fee))
            delivery += parseFloat(rule.fee);
        }

        delivery = isNumber(order.deliveryFee) ? parseFloat(order.deliveryFee) : delivery;

        return delivery;
      }

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

      const { surcharge: dinInSurcharge = {} } = this.dineInOpt;
      const { enable = false, rules } = dinInSurcharge;

      let delivery = type === 'DELIVERY' && !deliveryFree ? getDeliveryCharge() : 0;
      let { tip = 0, gratuity = 0, paid = 0 } = order.payment;
      let discount = 0;
      let subtotal = 0;
      let tax = 0;

      // double check paid params
      // if it is illegal value then reset to 0
      paid = isNumber(paid) ? parseFloat(paid) : 0;

      order.content.forEach(item => {
        if (item.void) return;

        const single = parseFloat(item.single);
        const qty = item.qty || 1;
        const taxClass = this.tax.class[item.taxClass];
        const orderType = item.orderType || type;
        let amount = toFixed(single * qty, 2);

        item.choiceSet.forEach(set => {
          const setPrice = parseFloat(set.single);

          if (setPrice !== 0) {
            const setQty = set.qty || 1;
            const setTotal = setQty * setPrice;
            amount = toFixed(amount + setTotal, 2);
          }
        });

        subtotal = toFixed(subtotal + amount, 2);

        if (!taxFree && taxClass.apply[orderType])
          tax += taxClass.rate / 100 * amount;
      });

      if (this.tax.deliveryTax) {
        let defaultTaxRate = 0;
        Object.keys(this.tax.class).forEach(type => {
          if (this.tax.class[type].default)
            defaultTaxRate = this.tax.class[type].rate;
        });

        tax += delivery * defaultTaxRate / 100;
      }

      let plasticTax = 0;
      if (this.tax.plasticPenalty) {
        //calculate plastic bag penalty
        const fine = isNumber(this.tax.plasticCharge)
          ? parseFloat(this.tax.plasticCharge)
          : 0.5;

        plasticTax = toFixed(plasticBag * fine, 2);
      }

      if ((type === "DINE_IN" || type === "HIBACHI" || type === "BAR" || type === "BUFFET") && !gratuityFree) {
        if (enable) {
          //find rule
          try {
            const { fee, percentage } = rules
              .sort((a, b) => a.guest < b.guest)
              .find(r => guest >= r.guest);
            gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
          } catch (e) { }
        }

        if (order.hasOwnProperty("gratuityPercentage")) {
          gratuity = toFixed(subtotal * order.gratuityPercentage / 100, 2);
        } else if (order.hasOwnProperty("gratuityFee")) {
          gratuity = order.gratuityFee;
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
                case "order":
                  const grandTotal = this.tax.beforeDiscount ? subtotal : subtotal + tax;
                  offer += coupon.discount / 100 * grandTotal;
                  break;
                default:
                  offer += coupon.discount / 100 * subtotal;
              }
              break;
          }
        });

        discount = toFixed(discount + offer, 2);

        // discount will never greater than subtotal
        if (this.tax.beforeDiscount) {
          discount = discount > subtotal ? subtotal : discount;
        } else {
          discount = discount > (subtotal + tax) ? toFixed(subtotal + tax, 2) : discount;
        }
      }

      const total = subtotal + plasticTax + toFixed(tax, 2);
      const totalCharge = total + delivery;
      const due = toFixed(Math.max(0, totalCharge - discount), 2);
      const grandTotal = toFixed((due + gratuity) * 100, 2);
      const rounding = this.$rounding(grandTotal);
      const balance = due + gratuity + rounding;
      const remain = balance - paid;

      // Reward Program 
      // when POS enables reward program
      // The order will have reward params
      if (order.hasOwnProperty('reward')) {
        // calculate current earn reward point
        const { reward } = this.store;
        let point = 0;

        switch (reward.unit) {
          case "PENNY":
            point = reward.beforeTax ? parseInt(subtotal * 100) : parseInt(balance * 100);
            break;
          case "DOLLAR":
            point = reward.beforeTax ? parseInt(subtotal) : parseInt(balance);
            break;
          case "CUSTOM":
            point = reward.beforeTax
              ? Math.trunc(subtotal / reward.custom * reward.toPoint)
              : Math.trunc(balance / reward.custom * reward.toPoint);
            break;
          case "PERCENTAGE":
            point = reward.beforeTax
              ? Math.trunc(subtotal * reward.percentage / 100 * reward.toPoint)
              : Math.trunc(balance * reward.percentage / 100 * reward.toPoint);
            break;
          default:
            point = reward.beforeTax ? parseInt(subtotal * 100) : parseInt(balance * 100);
        }

        order.reward.earn = parseInt(point) || 0;
      }

      const payment = {
        subtotal: toFixed(subtotal, 2),
        tax: toFixed(tax, 2),
        plasticTax: toFixed(plasticTax, 2),
        total: toFixed(total, 2),
        balance: toFixed(balance, 2),
        paid: toFixed(paid, 2),
        remain: toFixed(remain, 2),
        tip: toFixed(tip, 2),
        gratuity: toFixed(gratuity, 2),
        delivery: toFixed(delivery, 2),
        rounding: toFixed(rounding, 2),
        discount,
        due
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
    };

    Vue.prototype.$calculateRewardPoint = function (value, reverse) {
      const { reward = {
        perPoint: 1,
        asValue: 0
      } } = this.store || this.$store.getters.store;

      if (!reward) return 0;

      const each =
        isNumber(reward.perPoint) && reward.perPoint > 0 ? reward.perPoint : 1;

      return reverse
        ? Math.trunc(value / reward.asValue * reward.perPoint)
        : Math.trunc(value / each * reward.asValue * 100) / 100;
    }

    Vue.prototype.$splitEvenly = function (target) {

      if (target > 100) {
        const prompt = {
          type: "error",
          title: "dialog.cantExecute",
          msg: "dialog.exceedAllowLimit",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.$dialog(prompt).then(this.exitComponent);
        return;
      }

      return new Promise(resolve => {
        //deep copy target & assign parent id
        const parent = this.order._id;
        const ticketNumber = this.order.number;

        const child = JSON.parse(JSON.stringify(this.order));

        delete child.children;
        child.parent = parent;

        child.content.forEach(item => {
          if (item.qty === target) {
            item.qty = 1;
            item.deno = item.qty;
            item.total = item.single.toFixed(2);
          } else {
            item.single = toFixed(item.single / target, 2);
            item.total = (item.single * item.qty).toFixed(2);
          }

          item.choiceSet.forEach(set => {
            set.single = toFixed(set.single / target, 2);
            set.price = toFixed(set.single * set.qty, 2);
          });
        });

        const payment = this.$calculatePayment(child, {
          selfAssign: false,
          callback: true
        });

        let splits = [];

        for (let i = 1; i <= target; i++) {
          const _id = ObjectId().toString();
          const number = ticketNumber + "-" + i;

          splits.push(Object.assign({}, child, { _id, number, payment }));
        }

        this.$socket.emit("[SPLIT] SAVE", { splits, parent }, () => {
          //recalculate parent ticket
          console.time("split time")
          let payments = {};

          splits.forEach(({ payment }) => {
            Object.keys(payment).forEach(key => {
              if (payments[key]) {
                payments[key] += payment[key];
              } else {
                payments[key] = payment[key]
              }
            })
          })

          Object.keys(payments).forEach(key => {
            this.order.payment[key] = toFixed(payments[key], 2)
          });

          this.order.content.forEach(item => (item.split = true));
          this.order.children = splits.map(i => i._id);
          this.order.split = true;

          this.setOrder(this.order);
          this.$socket.emit("[ORDER] UPDATE", this.order, false, () => {
            console.timeEnd("split time")
            this.exitComponent();
            resolve();
          });
        });
      });
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

    Number.prototype.toFixed = function (n) {
      const power = Math.pow(10, n);
      let fixed = (Math.round(this * power) / power).toString();
      if (n == 0) return fixed;

      if (fixed.indexOf('.') < 0) fixed += '.';
      const padding = n + 1 - (fixed.length - fixed.indexOf('.'));

      for (let i = 0; i < padding; i++) {
        fixed += '0';
      }

      return fixed;
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
        const reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|ln|lane|drive|way|court|plaza|square|run|parkway|point|pike|pkwy|square|driveway|trace|park|terrace|circle|loop|blvd|broadway|trail|trl|\w)[^#]?/i;
        const match = address.match(reg);

        return match ? match[0] : false;
      },
      ease({ start = 1, end = 0, duration = 300, progress, done }) {
        const reverse = start < end;
        const count = duration / 16;
        const stepSize = Math.abs(start - end) / count;
        let current = start;

        const step = () => {
          current = reverse ? current + stepSize : current - stepSize;

          if (reverse ? current < end : current > end) {
            progress(current);
            window.requestAnimationFrame(step);
          } else {
            progress(end);
            done();
          }
        };

        step();
      },
      isCollide(x, y, tolerate = 1) {
        const { top: xTop, left: xLeft, height: xHeight, width: xWidth } = x.getBoundingClientRect();
        const { top: yTop, left: yLeft, height: yHeight, width: yWidth } = y.getBoundingClientRect();

        return !(
          xTop + xHeight < (yTop / tolerate) ||
          (xTop / tolerate) > yTop + yHeight ||
          xLeft + xWidth < (yLeft / tolerate) ||
          (xLeft / tolerate) > yLeft + yWidth
        );
      },
      isHoliday(date) {
        const holidays = {
          'M': {//Month, Day
            '01/01': "New Year's Day",
            '02/14': "Valentine's Day",
            '04/01': "April Fool's Day",
            '07/04': "Independence Day",
            '10/31': "Halloween",
            '11/11': "Veteran's Day",
            '12/24': "Christmas Eve",
            '12/25': "Christmas Day",
            '12/31': "New Year's Eve"
          },
          'W': {//Month, Week of Month, Day of Week
            '1/3/1': "Martin Luther King Jr. Day",
            '2/3/1': "Washington's Birthday",
            '5/5/1': "Memorial Day",
            '5/2/0': "Mother's Day",
            '6/3/0': "Father's Day",
            '9/1/1': "Labor Day",
            '10/2/1': "Columbus Day",
            '11/4/4': "Thanksgiving Day",
            '11/4/5': "Black Friday"
          }
        };
        const diff = 1 + (0 | (new Date(date).getDate() - 1) / 7);
        const memorial = (new Date(date).getDay() === 1 && (new Date(date).getDate() + 7) > 30) ? "5" : null;

        return (holidays['M'][moment(date).format('MM/DD')] || holidays['W'][moment(date).format('M/' + (memorial || diff) + '/d')]);
      }
    };

    window.clone = target =>
      Object.assign(Object.create(Object.getPrototypeOf(target)), target);
    window.toFixed = (number, fractionSize) => +(Math.round(+(number.toString() + "e" + fractionSize)).toString() + "e" + -fractionSize);
    // window.round = (number, precision = 2) => {
    //   const factor = Math.pow(10, precision);
    //   return Math.round(number * factor) / factor;
    // }
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
      const f = data => {
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
