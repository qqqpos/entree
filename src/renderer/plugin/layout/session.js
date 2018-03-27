const session = function (data) {
    const store = this.config;
    const html = createReport();
    const style = createStyle();

    this.plugin.PRINT_INIT("Report");
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
    this.plugin.PRINT();

    function createReport() {
        const payment = `
        <section class="type">\
            <h4>${data.subtitle}</h4>\
            <table>\
                <thead>\
                    <tr>\
                        <th>#</th>\
                        <th>Type</th>\
                        <th>Tips</th>\
                        <th>Amount</th>\
                        <th>Payment</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    ${data.payments.map(i => `
                    <tr>\
                        <td>${i.number}</td>\
                        <td>${i.ticket}</td>\
                        <td>${i.tip > 0 ? i.tip.toFixed(2) : ""}</td>\
                        <td>${i.amount.toFixed(2)}</td>\
                        <td>${i.payment}</td>\
                    </tr>`
            ).join("").toString()}
                </tbody>\
            </table></section>`;

        const session = `
        <section class="type">\
            <h4>Payment Summary</h4>\
            <table>\
                <thead>\
                    <tr>\
                        <th>Time</th>\
                        <th>Count</th>\
                        <th>Tips</th>\
                        <th>Amount</th>\
                    </tr>\
                </thead>\
                <tbody>\
                    ${data.sessions.map(i => {
                        const total = `<tr class="bold">\
                                        <td>${i.alias}</td>\
                                        <td>${i.count}</td>\
                                        <td>${i.tip > 0 ? i.tip.toFixed(2) : ""}</td>\
                                        <td>${i.amount.toFixed(2)}</td>\
                                    </tr>`;

                        const types = i.type.filter(t => t.count > 0).map(i => `
                                    <tr>\
                                        <td>${i.type}</td>\
                                        <td>( ${i.count} )</td>\
                                        <td>${i.tip > 0 ?  "( " + i.tip.toFixed(2) + " )" : ""}</td>\
                                        <td>( ${i.amount.toFixed(2)} )</td>\
                                    </tr>`
                        ).join("").toString();

                        return total + types;
                }).join("").toString()}
                </tbody>\
            </table></section>
        `

        const summary = `
            <section class="type">\
                <h4>Total Dine In Guest Served: ${data.guest}</h4>\
                <p><span class="type">Subtotal</span><span class="value">${data.subtotal.toFixed(2)}</span></p>\
                <p><span class="type">Tax</span><span class="value">${data.tax.toFixed(2)}</span></p>\
                <p><span class="type">Discount</span><span class="value">- ${data.discount.toFixed(2)}</span></p>\
                <p><span class="type">Rounding</span><span class="value">${data.rounding.toFixed(2)}</span></p>\
                <p class="bold"><span class="type">Total</span><span class="value">${data.total.toFixed(2)}</span></p>\
                <br>
                <p><span class="type">Tip</span><span class="value">${data.tip.toFixed(2)}</span></p>\
                <p><span class="type">Gratuity</span><span class="value">${data.gratuity.toFixed(2)}</span></p>\
                <p><span class="type">Total w. Tip & Gratuity</span><span class="value">${data.grandTotal.toFixed(2)}</span></p>\
                <br>
                <p><span class="type">Settled ( ${data.settledCount} )</span><span class="value">${data.settled.toFixed(2)}</span></p>\
                <p><span class="type indent">Cash</span><span class="value">( ${data.cash.toFixed(2)} )</span></p>\
                <p><span class="type">Unsettled ( ${data.unsettledCount} )</span><span class="value">${data.unsettled.toFixed(2)}</span></p>\
            </section>`;

        const departments = "";


        return `<section class="header">\
                <div class="store">\
                  <h3>${store.name}</h3>\
                  <h5>${store.address}</h5>\
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>\
                  <h5>${store.contact}</h5>\
                </div>\
                <div class="type">\
                  <h3>${data.title}</h3>\
                  <h5>${data.date}</h5>\
                </div>\
            </section>\
            ${payment + session + summary + departments}
            <footer>\
              <p>Thanks For Your Hard Work</p>\
              <p>Print @ ${moment().format("YY-MM-DD HH:mm:ss")}</p>\
            </footer>`;
    }

    function createStyle() {
        return `<style>\
            *{margin:0;padding:0;font-family:'Agency FB';}\
                section.header{text-align:center;}\
                .header h3{font-size:1.25em;font-weight:bold;}\
                div.type{margin:10px;}\
                div.type h3{font-weight:lighter;font-size:1.3em;}\
                div.type h5{margin-top:5px;font-size:1.25em;}\
                section.type{margin-bottom:10px;}\
                section h4{text-align:center;border:1px dashed #000;margin-bottom:5px;letter-spacing:1px;}\
                p{display:flex;}\
                p .value{flex:1;text-align:right;}\
                .indent{text-indent:1em;}\
                .bold{font-weight:bold;}\
                table {width: 100%;text-align: center;}\
                footer {border-top:1px solid #000;margin-top:15px;}
                footer p{text-align:center;display:block;}\
            </style>`;
    }
}

export default session;