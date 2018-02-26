const report = function (report) {
    const store = this.config;
    const html = createReport();
    const style = createStyle();

    this.plugin.PRINT_INIT("Report");
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
    this.plugin.PRINT();

    function createReport() {
        let content = "";

        for (let title in report) {
            if (report.hasOwnProperty(title) && report[title]) {
                let section = "";
                section += report[title].map(({ text, value, style }) =>
                    `<p class="${style}"><span class="text">${text}</span><span class="value">${value}</span></p>`
                ).join("").toString();
                content += `<section class="type"><h4>${title}</h4>${section}</section>`;
            }
        }

        return `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Sales Report</h3>
                </div>
            </section>
            ${content}
            <footer>
              <p>Powered by United POS&reg;</p>
            </footer>`;
    }

    function createStyle() {
        return `<style>
            *{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;font-weight:bold;}
                div.type{margin:10px;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:5px;font-size:1.25em;}
                section.type{margin-bottom:10px;}
                section h4{text-align:center;border:1px dashed #000;margin-bottom:10px;letter-spacing:1px;}
                p{display:flex;}
                p .text{flex:1;}
                .indent .text{text-indent:1.5em;font-style:italic;}
                .bold .value{font-weight:bold;}
                .space {margin-bottom:10px;}
                .total .value{border-top:1px dashed #000;}
                .breakline {border-bottom:1px dashed #000;}
                .value{min-width:90px;text-align:right;}
                footer p{text-align:center;border-top:1px solid #000;margin-top:15px;display:block;}
            </style>`;
    }
}

export default report;