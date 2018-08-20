const driver = function (report) {
    const store = this.config;
    const html = createReport();
    const style = createStyle();

    this.plugin.PRINT_INIT("Driver Report");
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
    this.plugin.PRINT();

    function createReport() {
        const invoices = report.invoices.length ?
            `<section class="type">\
<h4>Delivered List</h4>\
<table>\
    <thead>\
        <tr>\
            <th>#</th>\
            <th>Address</th>\
            <th>Tips</th>\
            <th>Amount</th>\
        </tr>\
    </thead>\
    <tbody>\
        ${report.invoices.map(i => `
        <tr>\
            <td>${i.number}</td>\
            <td class="left">
                <div>${i.address}</div>
                <div class="small">${i.city}</div>
            </td>\
            <td>${i.tip > 0 ? i.tip.toFixed(2) : ""}</td>\
            <td>${i.amount.toFixed(2)}</td>\
        </tr>`).join("").toString()}
    </tbody>\
</table></section>` : '';

        const summary = `
            <section class="type">\
                <h4>Summary</h4>\
                ${report.summary.map(i => `<p><span class="type">${i.text}</span><span class="value">${i.value}</span></p>`).join("").toString()}
            </section>`;

        return `<section class="header">\
                <div class="store">\
                  <h3>${store.name}</h3>\
                  <h5>${store.address}</h5>\
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>\
                  <h5>${store.contact}</h5>\
                </div>\
                <div class="type">\
                  <h3>${report.title}</h3>\
                  <h5>${report.date}</h5>\
                </div>\
            </section>\
            ${invoices + summary}
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
                section.type p:last-child{font-weight:bold;margin-top:10px;}
                section h4{text-align:center;border:1px dashed #000;margin-bottom:5px;letter-spacing:1px;}\
                p{display:flex;}\
                p .value{flex:1;text-align:right;}\
                .left{text-align:left;}
                .small{font-size:0.7em;}
                .indent{text-indent:1em;}\
                .bold{font-weight:bold;}\
                table {width: 100%;text-align: center;}\
                footer {border-top:1px solid #000;margin-top:15px;}
                footer p{text-align:center;display:block;}\
            </style>`;
    }
}

export default driver;