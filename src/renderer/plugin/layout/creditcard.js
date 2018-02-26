const creditcard = function (trans, reprint) {
    const store = this.config;
    const device = this.station.receipt || 'cashier';
    const timestamp = moment(Number(trans.trace.time), 'YYYYMMDDHHmmss');
    const date = timestamp.format("MM / DD / YYYY");
    const time = timestamp.format("HH:mm:ss");

    let html = createHtml();
    const style = createStyle();

    this.plugin.PRINT_INIT('Credit Card - Store');
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(device);
    this.plugin.PRINT();

    this.plugin.PRINT_INIT('Credit Card - Customer');

    html = html.replace("MERCHANT COPY", "CUSTOMER COPY");

    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(device);
    this.plugin.PRINT();

    function createHtml() {
        const due = parseFloat(trans.amount.due) > 0 ? `<p class="due"><span class="text">Due:</span><span class="value">$${trans.amount.due}</span></p>` : "";
        const duplicate = reprint ? '<p class="center">***Duplicate***</p>' : '';
        return `<section class="header">
                    <div class="store">
                      <h3>${store.name}</h3>
                      <h5>${store.address}</h5>
                      <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                      <h5>${store.contact}</h5>
                    </div>
                    <div class="type">
                      <h3>${trans.transType}</h3>
                    </div>
                  </section>
                  <article>
                    <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>
                    <p><span class="text">Transaction:</span><span class="value"># ${trans.trace.trans}</span></p>
                    <p><span class="text">Card Type</span><span class="value">${trans.account.type}</span></p>
                    <p><span class="text">Account</span><span class="value">**** **** **** ${trans.account.number}</span></p>
                    <p><span class="text">Entry</span><span class="value">${trans.account.entry}</span></p>
                    <p><span class="text">Present</span><span class="value">${trans.account.present}</span></p>
                    <p class="bold amount"><span class="text">Amount:</span><span class="value">$ ${(trans.amount.approve - trans.amount.tip).toFixed(2)}</span></p>
                    ${due}
                    <p class="bold"><span class="text">Tip:</span><span class="value ul">$ ${parseFloat(trans.amount.tip) > 0 ? trans.amount.tip : ''}</span></p>
                    <p class="bold"><span class="text">Total:</span><span class="value ul">$</span></p>
                    <p><span class="text">Auth Code</span><span class="value">${trans.host.auth}</span></p>
                    <p><span class="text">Response</span><span class="value">${trans.host.msg}</span></p>
                    <p><span class="text">From Station</span><span class="value">${trans.station}</span></p>
                  </article>
                  <footer>
                    <div class="index">${trans.index || ""}</div>
                    <div class="agreement">
                      <p>I AGREE TO PAY ABOVE TOTAL AMOUNT</p>
                      <p>ACCORDING TO CARD ISSUER AGREEMENT</p>
                      <p>(MERCHANT AGREEMENT IF CREDIT VOUCHER)</p>
                    </div>
                    <p class="sign">X</p>
                    <p class="center">${trans.account.holder}</p>
                    <p class="center">MERCHANT COPY</p>
                    ${duplicate}
                  </footer>`;
    }

    function createStyle() {
        return `<style>
              *{margin:0;padding:0;font-family:'Agency FB';}
              section.header{text-align:center;}
              .header h3{font-size:1.25em;}
              .header h5{font-size:16px;font-weight:lighter}
              div.type{margin:10px;}
              div.type h3{font-weight:lighter;font-size:1.3em;}
              div.type h5{margin-top:-5px;font-size:1.25em;}
              article p{display:flex;}
              article .text{flex:2;}
              article .value{flex:4;text-align:right}
              p.bold{font-weight:bold;font-size:1.25em;display:flex;}
              .bold .text{width:120px;text-align:right;margin-right:10px;}
              .bold .value{flex:1;text-align:left;}
              .ul{border-bottom:1px solid #000;}
              .agreement{text-align:center;margin:15px 0;}
              p.sign{border-bottom:1px solid #000;margin-top:20px;}
              p.center{text-align:center;}
              footer{position:relative;}
              .index{font-size:30px;font-weight:bold;position:absolute;bottom:5px;left:10px;}
            </style>`;
    }


}


export default creditcard;