const ticket = function(raw, receipt) {
  const printers = this.getPrinters();
  const ticket = raw.type;

  printers.forEach(printer => {
    const setting = this.setting[printer];

    if (!setting) return false;
    if (!receipt && !setting.print.includes(ticket)) return false;
    if (setting.type === "label") {
      this.printLabel(printer, raw);
      return false;
    }

    const items = raw.content.filter(item => item.printer[printer]);

    if (setting.type === "hibachi" && items.length > 0) {
      const slicer = array => {
        let next = [];
        let current = [];
        array.filter(item => {
          const index = current.findIndex(i => i.seat === item.seat);
          index === -1 ? current.push(item) : next.push(item);
        });
        this.printHibachi(printer, raw, current);
        next.length && slicer(next);
      };
      slicer(items);
      return false;
    }

    if (items.length === 0) return false;

    const header = createHeader(this.config, setting, raw);
    const list = createList(printer, setting, raw, false);

    if (list.length === 0) return false;

    const style = createStyle(setting);
    const footer = createFooter(this.config, setting, printer, raw);
    const html = header + list + footer + style;

    setting.control.buzzer && this.buzzer(printer);

    this.plugin.PRINT_INIT("Ticket Receipt");
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
    this.plugin.SET_PRINTER_INDEX(printer);
    this.plugin.PRINT();

    if (raw.hasOwnProperty("__creditPayment__") && /cashier/i.test(printer)) {
      this.plugin.PRINT_INIT("Ticket Credit Payment");
      this.plugin.SET_PRINTER_INDEX(printer);
      this.plugin.PRINT_INITA(0, 0, 270, 500, "");
      this.plugin.ADD_PRINT_TEXT(0, 35, 100, 21, "# " + raw.number);
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 18);
      this.plugin.SET_PRINT_STYLEA(0, "Alignment", 1);
      this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
      this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
      this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
      this.plugin.ADD_PRINT_TEXT(0, 50, 165, 21, setting.title[raw.type]);
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 18);
      this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

      this.plugin.ADD_PRINT_TEXT(30, 0, 250, 34, raw.__creditPayment__.number);
      this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 17);
      this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
      this.plugin.ADD_PRINT_TEXT(68, 40, 60, 20, raw.__creditPayment__.date);
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
      this.plugin.ADD_PRINT_TEXT(68, 90, 60, 20, raw.__creditPayment__.cvc);
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
      this.plugin.ADD_PRINT_TEXT(68, 115, 100, 20, raw.payment.due.toFixed(2));
      this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
      this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
      this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
      this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

      this.plugin.PRINT();
    }

    if (Array.isArray(setting.reprint) && setting.reprint.includes(ticket)) {
      this.plugin.PRINT_INIT(`Reprint ticket ${raw.number}`);
      this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
      this.plugin.SET_PRINTER_INDEX(printer);
      this.plugin.PRINT();
    }
  });
  this.reset();
};

const preview = function(printer, ticket) {
  printer = printer || "cashier";

  const setting = this.setting[printer];
  const header = createHeader(this.config, setting, ticket);
  const list = createList(printer, setting, ticket, true);
  const style = createStyle(setting);
  const footer = createFooter(this.config, setting, printer, ticket);
  const html = header + list + footer + style;

  return html;
};

function createHeader(store, setting, raw) {
  const {
    type,
    time,
    number,
    server,
    cashier,
    station,
    table,
    guest,
    customer
  } = raw;
  const phone = customer.phone
    ? customer.phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3")
    : null;
  const title = setting.title[type] || type.replace("_", " ").toCapitalCase();
  const date = moment(Number(time)).format("MM-DD-YYYY");
  const placeTime = moment(Number(time))
    .locale("en")
    .format("hh:mm a");
  const handler = `<p>\
                    <div class="wrap">\
                        <span class="text">Server:</span>\
                        <span class="value">${server}</span>\
                        <span class="text">Station:</span>\
                        <span class="value">${station || ""}</span>\
                    </div>\
                  </p>`;

  const { address, distance, duration, city, name, note } = customer;

  let information = "";

  information += phone
    ? `<p>\
        <span class="value tel">${phone}</span>\
        <span class="ext">${customer.extension}</span>\
       </p>`
    : "";

  if (raw.type === "DELIVERY") {
    information += address
      ? `<p>\
            <span class="value addr">${address}</span>\
        </p>`
      : "";
    information +=
      city && store.city.toUpperCase() !== city.toUpperCase()
        ? `<p><span class="value pt">${city}</span></p>`
        : "";
  }

  information += name ? `<p><span class="value pt">${name}</span></p>` : "";
  information += note ? `<p><span class="value pt">${note}</span></p>` : "";

  return `<section class="header">\
                <div class="store">\
                    <h3>${store.name}</h3>\
                    <h5>${store.address}</h5>\
                    <h5>${store.city} ${store.state} ${store.zipCode}</h5>\
                    <h5>${store.contact}</h5>\
                </div>\
                <h1>${title}</h1>\
                <div class="time">\
                    <span>Date: ${date}</span>\
                    <span>Time: ${placeTime}</span>\
                    <div class="ticketNumber">${number}</div>\
                    <div class="tableName">${table || ""}</div>\
                </div>\
                <div class="server">${handler}</div>\
                <div class="customer">${information}</div>\
            </section>`;
}

function createList(printer, setting, invoice, preview) {
  const list = JSON.parse(JSON.stringify(invoice.content));
  let { categorize, prioritize, mode } = setting.control;
  const { languages } = setting.layout;
  const primary = languages.find(t => t.ref === "usEN");
  const secondary = languages.find(t => t.ref === "zhCN");

  let content = [],
    items = [];

  if (preview) mode = "preview";

  switch (mode) {
    case "normal":
      items = !invoice.print
        ? list.filter(item => item.printer[printer])
        : list.filter(
            item => item.printer[printer] && item.diffs !== "removed"
          );
      break;
    case "difference":
      if (!invoice.print) {
        items = list.filter(item => item.printer[printer] && !item.print);
      } else {
        items = list.filter(
          item =>
            item.printer[printer] && !item.print && item.diffs !== "unchanged"
        );
        items.forEach(item => {
          switch (item.diffs) {
            case "less":
            case "more":
              item.qty = item.origin + "&rsaquo;" + item.qty;
              break;
            case "new":
              item.zhCN = "★" + item.zhCN;
              item.usEN = "★" + item.usEN;
            case "removed":
              break;
            case "inserted":
              item.choiceSet.forEach(set => {
                set.zhCN = "★" + set.zhCN;
                set.usEN = "★" + set.usEN;
              });
              break;
          }
        });
      }
      break;
    case "new":
      if (!invoice.print) {
        items = list.filter(item => item.printer[printer] && !item.print);
      } else {
        items = list.filter(
          item =>
            item.printer[printer] &&
            !item.print &&
            (item.diffs === "new" || item.diffs === "inserted")
        );
        items.forEach(item => {
          switch (item.diffs) {
            case "new":
              item.zhCN = "★" + item.zhCN;
              item.usEN = "★" + item.usEN;
              break;
            case "inserted":
              item.choiceSet.forEach(set => {
                set.zhCN = "★" + set.zhCN;
                set.usEN = "★" + set.usEN;
              });
              break;
          }
        });
      }
      break;
    case "todo":
      if (!invoice.print) {
        items = list.filter(item => item.printer[printer] && !item.print);
      } else {
        items = list
          .filter(
            item =>
              item.printer[printer] &&
              (item.diffs === "unchanged" || item.diffs === "new")
          )
          .map(item => {
            switch (item.diffs) {
              case "unchanged":
                item.zhCN = "☑ " + item.zhCN;
                item.usEN = "☑ " + item.usEN;
                break;
              case "new":
                item.zhCN = "☐ " + item.zhCN;
                item.usEN = "☐ " + item.usEN;
                break;
              default:
            }
            return item;
          });
      }
      break;
    default:
      items = !invoice.print
        ? list.filter(item => item.printer[printer])
        : list.filter(
            item => item.printer[printer] && item.diffs !== "removed"
          );
  }

  if (items.length === 0) return [];

  const renderQty = items.filter(i => i.qty > 1).length > 0;

  prioritize && items.sort((p, n) => (p.priority || 0) < (n.priority || 0));

  if (categorize) {
    let sorted = [];
    let categoryMap = [];

    for (let i = 0; i < items.length; i++) {
      let category = items[i].category;
      if (!sorted[category]) {
        sorted[category] = [];
        categoryMap[category] = items[i].categoryCN;
        sorted[category].push(items[i]);
      } else {
        sorted[category].push(items[i]);
      }
    }
    for (let category in sorted) {
      if (sorted.hasOwnProperty(category)) {
        content += `<div class="category"><span class="zhCN">${
          categoryMap[category]
        }</span><span class="usEN">${category}</span></div>`;
        content += sorted[category]
          .map(item => mockup(item, renderQty))
          .join("")
          .toString();
      }
    }
  } else {
    content = items
      .map(item => mockup(item, renderQty))
      .join("")
      .toString();
  }

  return `<section class="receipt">${content}</section>`;

  function mockup(item, renderQty) {
    const { replace = false, zhCN, usEN, note } = item.printer[printer];
    const idCN = secondary.id ? item.menuID + " " : "";
    const idEN = primary.id ? item.menuID + " " : "";
    const nameCN = replace ? idCN + zhCN : idCN + (item.zhCN || "");
    const nameEN = replace ? idEN + usEN : idEN + (item.usEN || "");
    const sideCN = item.side.zhCN || "";
    const sideEN = item.side.usEN || "";
    const cnPrice = secondary.price
      ? `<span class="price">${item.total}</span>`
      : "";
    const enPrice = primary.price
      ? `<span class="price">${item.total}</span>`
      : "";
    const enableChinese = secondary.enable;
    const enableEnglish = primary.enable;
    const qty = renderQty
      ? `<span class="qty">${item.qty === 1 ? "" : item.qty}</span>`
      : "";
    const diffs = item.diffs || "";

    let chineseItem = "",
      englishItem = "",
      chineseSub = "",
      englishSub = "";

    item.choiceSet.forEach(set => {
      if (set.hasOwnProperty(print) && !set.print.includes(printer)) return;
      const _qty = set.qty !== 1 ? set.qty + " x " : "";
      const _price =
        Math.abs(set.price) > 0 ? `( ${set.price.toFixed(2)} )` : "";

      if (diffs === "removed") {
        chineseSub += enableChinese
          ? `<p>\
                <del></del>\
                <span>${_qty}</span>\
                <span>${set.zhCN}</span>\
                <span>${_price}</span>\
            </p>`
          : "";
        englishSub += enableEnglish
          ? `<p>\
                <del></del>\
                <span>${_qty}</span>\
                <span>${set.usEN}</span>\
                <span>${_price}</span>\
            </p>`
          : "";
      } else {
        chineseSub += enableChinese
          ? `<p>\
                <span>${_qty}</span>\
                <span>${set.zhCN}</span>\
                <span>${_price}</span>\
            </p>`
          : "";
        englishSub += enableEnglish
          ? `<p>\
                <span>${_qty}</span>\
                <span>${set.usEN}</span>\
                <span>${_price}</span>\
            </p>`
          : "";
      }
    });
    if (diffs === "removed") {
      chineseItem = enableChinese
        ? `<div class="zhCN">\
                <div class="main">\
                    <del></del>\
                    ${qty}
                    <div class="wrap">\
                        <span class="item">${nameCN}</span>\
                        <span class="side">${sideCN}</span>\
                    </div>\
                    ${cnPrice}
                </div>\
                <div class="sub">${chineseSub}</div>\
            </div>`
        : "";
      englishItem = enableEnglish
        ? `<div class="usEN">\
                <div class="main">\
                    <del></del>\
                    ${qty}
                    <div class="wrap">\
                        <span class="item">${nameEN}</span>\
                        <span class="side">${sideEN}</span>\
                    </div>\
                    ${enPrice}
                </div>\
                <div class="sub">${englishSub}</div>\
            </div>`
        : "";
    } else {
      chineseItem = enableChinese
        ? `<div class="zhCN">\
                <div class="main">\
                    ${qty}
                    <div class="wrap">\
                        <span class="item">${nameCN}</span>\
                        <span class="side">${sideCN}</span>\
                    </div>\
                    ${cnPrice}
                </div>\
                <div class="sub">${chineseSub}</div>\
            </div>`
        : "";
      englishItem = enableEnglish
        ? `<div class="usEN">\
                <div class="main">\
                    ${qty}
                    <div class="wrap">\
                        <span class="item">${nameEN}</span>\
                        <span class="side">${sideEN}</span>\
                    </div>\
                    ${enPrice}
                </div>\
                <div class="sub">${englishSub}</div>\
            </div>`
        : "";
    }
    return languages[0].ref === "zhCN"
      ? chineseItem + englishItem
      : englishItem + chineseItem;
  }
}

function createStyle(setting) {
  const { contact, title, customer, payment, languages } = setting.layout;
  const primary = languages.find(t => t.ref === "usEN");
  const secondary = languages.find(t => t.ref === "zhCN");
  const fontFamily =
    navigator.language === "zh-CN" ? "微软雅黑" : "Microsoft YaHei";

  return `<style>\
              *{margin:0;padding:0}\
              section.header{font-family:'Agency FB';text-align:center;}\
              div.store{margin-bottom:10px;${contact ? "" : "display:none;"}}\
              .store h3{font-size:1.25em;}\
              .store h5{font-size:16px;font-weight:lighter}\
              h1{${
                title ? "" : "display:none;"
              }font-size:1.5em;font-family:"${fontFamily}"}\
              .ticketNumber,.tableName{position:absolute;bottom:12px;font-size:2em;font-weight:bold;}\
              footer .ticketNumber,footer .tableName{top: 5px;bottom: initial;}\
              .ticketNumber{right:10px;}.table{left:10px;}\
              div.time span{display:inline-block;margin:0 10px;font-size:1em;}\
              div.time{border-bottom:1px solid #000;position:relative;margin-top:10px;}\
              .server{border-bottom:1px solid #000;padding-bottom:1px;text-align:left;}\
              .server .wrap{display:flex;padding:0 10px;}\
              .server .text{flex:2;}.server .value{flex:3;}\
              .customer {${
                customer ? "" : "display:none;"
              }font-size:1.2em;font-family:'Tensentype RuiHeiJ-W2';text-align:left;}\
              .customer p:last-child{border-bottom:1px solid #000;}\
              .tel{letter-spacing:2px;}.ext{margin-left:10px;}\
              .pt{font-size:0.8em;}
              section.receipt{width:100%;margin:5px 0;}\
              .main{display:flex;position:relative;width:100%;}\
              .main .wrap,.empty{flex:1;}\
              .main .side{font-size:0.9em;margin-left:2px;}\
              .sub{padding-left:20px;font-size:0.8em;}\
              .sub p{position:relative;width:100%;}\
              .qty{min-width:15px;margin-right:5px;}\     
              footer{font-family:'Agency FB';}\
              section.column{display:flex;}\
              .payment{min-width:150px;${
                payment
                  ? "display:flex;flex-direction:column;"
                  : "display:none;"
              }}\
              .payment p{display:flex;font-family:'Tensentype RuiHeiJ-W2';width:200px;}\
              .payment .text{flex:1;text-align:right;}\
              .payment .value{min-width:40%;text-align:right;}\
              .settle{${payment ? "" : "display:none;"}}\
              .payment p.bold{font-weight:bold;font-size:22px;}\
              .details{border:1px dashed #000;margin-top:5px;text-align:center;}\
              .details h3{letter-spacing:1px;}\
              .details p{display:flex;}\
              .details .text{text-align:right;padding-right:20px;flex:5;}\
              .details .value{text-align:left;flex:6}\
              .suggestion{border:1px dashed #000;padding:5px;display:flex;flex-direction:column;text-align:center;}\
              .suggestion h5{font-size:22px;}\
              .suggestion i{font-style: italic;font-size:14px;}\
              .suggestion div{display:flex;justify-content: center;width:75%;margin:auto;}\
              .dash{margin: 0 5px;}\
              .tips{margin-left:15px;}\
              footer p,.geo h1{text-align:center;}\
              .slogan{font-weight:lighter;margin-top:10px;border-top:1px solid #000;position:relative;}\
              .tradeMark {font-weight: bold;display: inline-block;padding: 5px 7px;background: #000;color: #fff;}\
              .zhCN{font-family:'${secondary.fontFamily}';font-size:${
    secondary.fontSize
  }px;}\
              .usEN{font-family:'${primary.fontFamily}';font-size:${
    primary.fontSize
  }px;}\
              del{display:block;position:absolute;width:inherit;height:2px;background:#000;top:40%;}\
          </style>`;
}

function createFooter(config, setting, printer, ticket) {
  if (!ticket.hasOwnProperty("payment")) return "";

  const {
    ticketNumber,
    tableName,
    jobTime,
    tradeMark,
    geo,
    content
  } = setting.control.footer;
  const { enable, percentages } = config.tipSuggestion;
  const { type, payment, coupons, number, table, customer } = ticket;

  let suggestions = "";

  if (enable && type === "PRE_PAYMENT") {
    const { balance } = payment;
    const data = percentages
      .split(",")
      .map(pct => ({
        pct,
        val: (balance * pct / 100).toFixed(2),
        tip: (balance * (1 + pct / 100)).toFixed(2)
      }))
      .map(
        tip =>
          `<div class="outer">\
                <span>${tip.pct}%<span class="dash">-</span>$ ${tip.val}</span>\
                <span class="tips">( $ ${tip.tip} )</span>\
            </div>`
      )
      .join("")
      .toString();

    suggestions = `<section class="suggestion">\
                            <h5>Tips Suggestion</h5>\
                            <i>These tip amounts are provided for your convenience.</i>\
                            ${data}\
                        </section>`;
  }

  const slogan = content
    .map(text => `<p>${text}</p>`)
    .join("")
    .toString();

  let settle = [];
  const applied = payment.applyCoupon || true;

  if (coupons && applied)
    coupons.forEach(coupon =>
      settle.push(`<section class="details"><h3>${coupon.alias}</h3></section>`)
    );

  payment.log.forEach(log => {
    const { type, subType, lfd, paid, change } = log;
    switch (type) {
      case "CASH":
        settle.push(`<section class="details">\
                        <h3>Paid by Cash - Thank You</h3>\
                        <p>\
                            <span class="text">Paid:</span>\
                            <span class="value">$ ${paid.toFixed(2)}</span>\
                        </p>\
                        <p>\
                        <span class="text">Change:</span>\
                        <span class="value">$ ${change.toFixed(2)}</span>\
                        </p>\
                    </section>`);
        break;
      case "CREDIT":
        settle.push(`<section class="details">\
                        <h3>CREDIT CARD - ${subType} ( ${lfd} )</h3>\
                        <p>\
                            <span class="text">Paid:</span>\
                            <span class="value">$ ${paid.toFixed(2)}</span>\
                        </p>\
                    </section>`);
        break;
      case "GIFT":
        settle.push(`<section class="details">\
                        <h3>Paid by GIFT Card - Thank You</h3>\
                        <p>\
                            <span class="text">Paid:</span>\
                            <span class="value">$ ${paid.toFixed(2)}</span>\
                        </p>
                    </section>`);
        break;
      default:
        settle.push(
          `<section class="details"><h3>Paid by ${subType} - Thank You</h3></section>`
        );
    }
  });

  if (payment.paid > 0 && payment.remain > 0)
    settle.push(
      `<section class="details"><h3>Balance Due: $ ${payment.remain.toFixed(
        2
      )}</h3></section>`
    );

  if (ticket.status === 0) {
    const voidNote = `Void by: ${ticket.void.by} @ ${moment(
      ticket.void.time
    ).format("HH:mm:ss")}`;

    settle.push(`<section class="details">\
                    <h3>*** Ticket Voided ***</h3>\
                    <p>\
                        <span class="text">Reason:</span>\
                        <span class="value">${ticket.void.note}</span>\
                    </p>\
                    <h3>${voidNote}</h3>\
                </section>`);
  }

  let detail = [];
  [
    "subtotal",
    "discount",
    "tax",
    "delivery",
    "tip",
    "gratuity",
    "rounding",
    "total"
  ].forEach(key => {
    if (isNumber(payment[key]) && payment[key] !== 0) {
      let style = "";
      let value = payment[key].toFixed(2);
      let text = key.toCapitalCase();

      switch (key) {
        case "discount":
          value = `- ${value}`;
          break;
        case "gratuity":
          text = "Service Fee";
          break;
        case "total":
          value = payment.balance.toFixed(2);
          style = "bold";
          break;
      }

      detail.push(
        `<p class="${style}"><span class="text">${text}:</span><span class="value">${value}</span></p>`
      );
    }
  });

  const _waterMark =
    tradeMark && ticket.tradeMark
      ? `<p class="tm"><span class="tradeMark">${ticket.tradeMark}</span></p>`
      : "";
  const _time = jobTime
    ? `<p class="printTime">${printer} print @ ${moment().format(
        "hh:mm:ss"
      )}</p>`
    : "";
  const _number = ticketNumber
    ? `<div class="ticketNumber">${number}</div>`
    : "";
  const _table = tableName ? `<div class="tableName">${table || ""}</div>` : "";
  const extraInfo = _waterMark + _time + _number + _table;
  const _geo = geo
    ? `<div class="geo">\
            <p>${customer.duration || ""}</p>\
            <p>${customer.distance || ""}</p>\
            <h1>${customer.direction || ""}</h1>
        </div>`
    : "";

  return `<footer>\
            <section class="column">\
            <div class="empty">${_geo}</div>\
            <div class="payment">\
                ${detail.join("").toString()}
            </div>\
            </section>\
            <div class="settle">\
            ${suggestions + settle.join("").toString()}
            </div>\
            <div class="slogan">\
            ${slogan}
            ${extraInfo}
            </div>\
        </footer>`;
}

export { ticket as Ticket, preview as Preview };
