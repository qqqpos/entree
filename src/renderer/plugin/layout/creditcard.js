const creditcard = function (trans, { print = true, tipSuggestion = false }, reprint) {
  if (!print) return;

  const store = this.config;
  const device = this.station.receipt || 'cashier';
  const timestamp = moment(Number(trans.trace.time), 'YYYYMMDDHHmmss');
  const date = timestamp.format("MM / DD / YYYY");
  const time = timestamp.format("HH:mm:ss");

  let suggestions = "";

  if (tipSuggestion) {
    const { percentages = "15,18,20" } = store.tipSuggestion;
    const amount = trans.amount.approve;

    const data = percentages.split(",").map(pct => ({
      pct,
      val: (amount * pct / 100).toFixed(2),
      tip: (amount * (1 + pct / 100)).toFixed(2)
    })).map(tip => `<div class="tips">\
                      <span class="pct">${tip.pct} %</span>\
                      <span class="val">$ ${tip.val}</span>\
                      <span class="tip">( $ ${tip.tip} )</span>\
                    </div>`)
      .join("")
      .toString();

    suggestions = `<section class="suggestion center">\
                      <h5>Tips Suggestion</h5>\
                      <i>These tip amounts are provided for your convenience.</i>\
                      ${data}\
                  </section>`;
  }

  let html = createHtml();
  const style = createStyle();
  const duplicate = reprint ? '<p class="center">***Duplicate***</p>' : '';

  let signature = trans.signature && trans.signature.image ? `<div class="signature center"><img src="${trans.signature.image}"></div>` : `<p class="sign">X</p>`;
  let footer = `${suggestions}
                <footer>\
                  <div class="index">${trans.index || ""}</div>\
                  <div class="agreement">\
                    <p>I AGREE TO PAY ABOVE TOTAL AMOUNT</p>\
                    <p>ACCORDING TO CARD ISSUER AGREEMENT</p>\
                    <p>(MERCHANT AGREEMENT IF CREDIT VOUCHER)</p>\
                  </div>\
                  ${signature}
                  <p class="center">${trans.account.holder}</p>\
                  <p class="center">MERCHANT COPY</p>\
                  ${duplicate}
                </footer>`;

  this.plugin.PRINT_INIT('Credit Card - Store');
  this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + footer + style);
  this.plugin.SET_PRINTER_INDEX(device);
  this.plugin.PRINT();

  this.plugin.PRINT_INIT('Credit Card - Customer');

  footer = `<footer>\
              <div class="agreement center">\
                <p>I AGREE TO PAY ABOVE TOTAL AMOUNT</p>\
                <p>ACCORDING TO CARD ISSUER AGREEMENT</p>\
                <p>(MERCHANT AGREEMENT IF CREDIT VOUCHER)</p>\
              </div>\
              <p class="center">${trans.account.holder}</p>\
              <p class="center">CUSTOMER COPY</p>\
              ${duplicate}
            </footer>`;

  this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + footer + style);
  this.plugin.SET_PRINTER_INDEX(device);
  this.plugin.PRINT();

  function createHtml() {
    const due = parseFloat(trans.amount.due) > 0 ? `<p class="due"><span class="text">Due:</span><span class="value">$${trans.amount.due}</span></p>` : "";
    const ticketInfo = (trans.order && trans.order.hasOwnProperty("type") && trans.order.hasOwnProperty("number")) ?
      `<p><span class="text">Ticket</span><span class="value">( # ${trans.order.number} ) ${trans.order.type.replace("_", " ")}</span></p>\
       <p><span class="text">${trans.order.server ? 'Server' : 'Cashier'}</span><span class="value">${trans.order.server || trans.order.cashier}</span></p>` : "";
    const tipLine = parseFloat(trans.amount.tip) > 0 ?
      `<p class="bold"><span class="text">Tip:</span><span class="value ul">$ ${trans.amount.tip}</span></p><p class="bold"><span class="text">Extra Tip:</span><span class="value ul">$ </span></p>` :
      `<p class="bold"><span class="text">Tip:</span><span class="value ul">$ </span></p>`
    return `<section class="header center">\
              <div class="store">\
                <h3>${store.name}</h3>\
                <h5>${store.address}</h5>\
                <h5>${store.city} ${store.state} ${store.zipCode}</h5>\
                <h5>${store.contact}</h5>\
                <h5>${store.website || ""}</h5>\
              </div>\
              <div class="type">\
                <h3>${trans.transType}</h3>\
              </div>\
            </section>\
            <article>\
              <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>\
              <p><span class="text">Transaction:</span><span class="value"># ${trans.trace.trans}</span></p>\
              <p><span class="text">Card Type</span><span class="value">${trans.account.type}</span></p>\
              <p><span class="text">Account</span><span class="value">**** **** **** ${trans.account.number}</span></p>\
              <p><span class="text">Entry</span><span class="value">${trans.account.entry}</span></p>\
              <p><span class="text">Present</span><span class="value">${trans.account.present}</span></p>\
              <p class="bold amount"><span class="text">Amount:</span><span class="value">$ ${(trans.amount.approve - trans.amount.tip).toFixed(2)}</span></p>\
              ${due + tipLine}
              <p class="bold"><span class="text">Total:</span><span class="value ul">$</span></p>\
              <p><span class="text">Auth Code</span><span class="value">${trans.host.auth}</span></p>\
              <p><span class="text">Response</span><span class="value">${trans.host.msg}</span></p>\
              <p><span class="text">Terminal</span><span class="value">${trans.terminal}</span></p>\
              ${ticketInfo}
            </article>`;
  }

  function createStyle() {
    return `<style>\
              *{margin:0;padding:0;font-family:'Agency FB';}\
              .header h3{font-size:1.25em;}\
              .header h5{font-size:16px;font-weight:lighter}\
              .center{text-align:center;}\
              div.type{margin:10px;}\
              div.type h3{font-weight:lighter;font-size:1.3em;}\
              div.type h5{margin-top:-5px;font-size:1.25em;}\
              article p{display:flex;}\
              article .text{flex:2;}\
              article .value{flex:4;text-align:right}\
              p.bold{font-weight:bold;font-size:1.25em;display:flex;}\
              .bold .text{width:120px;text-align:right;margin-right:10px;}\
              .bold .value{flex:1;text-align:left;}\
              .ul{border-bottom:1px solid #000;}\
              .agreement{margin:15px 0;}\
              p.sign{border-bottom:1px solid #000;margin-top:20px;}\
              .signature {width: 265px;height: 100px;border-bottom: 1px solid #000;overflow: hidden;}
              footer{position:relative;}\
              .suggestion{border:1px dashed #000;padding:5px;display:flex;flex-direction:column;}\
              .suggestion h5{font-size:22px;}\
              .suggestion i{font-style: italic;font-size:14px;}\
              .suggestion .tips{display:flex;justify-content: center;width:80%;margin:auto;}\
              .pct {width: 50px;text-align: right; padding: 0 20px 0 10px;}
              .tip {flex: 1;text-align: left;text-indent: 10px;}
              .val {min-width: 40px;text-align: left;}
              .index{font-size:30px;font-weight:bold;position:absolute;bottom:5px;left:10px;}\
            </style>`;
  }
}

export default creditcard;