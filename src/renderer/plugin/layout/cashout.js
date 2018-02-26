const cashOut = function (data, detail) {
    const store = this.config;
    const date = moment().format("MM/DD/YYYY");
    const time = moment().format("hh:mm:ss");
    let amount = 0;
    let list = detail ? data.activity.map(log => `            
                <div class="log">
                <span class="action">${log.operator}</span>
                  <div class="record">
                    <span>${log.ticket === null ? '&nbsp;' : '#' + log.ticket.number}</span>
                    <span>${log.ticket === null ? '&nbsp;' : log.ticket.type}</span>
                  </div>
                  <div class="record">
                    <span>+ ${log.inflow.toFixed(2)}</span>
                    <span>- ${log.outflow.toFixed(2)}</span>
                  </div>
                  <span class="diff">$${(amount += (log.inflow - log.outflow)).toFixed(2)}</span>
              </div>`).join("").toString() : "";

    const html = `<section class="header">
                  <div class="store">
                    <h3>${store.name}</h3>
                    <h5>${store.address}</h5>
                    <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                    <h5>${store.contact}</h5>
                  </div>
                  <div class="type">
                    <h3>Cash Out</h3>
                    <h5>Report</h5>
                  </div>
                  <div class="time">
                    <span>Date: ${date}</span>
                    <span>Time: ${time}</span>
                  </div>
              </section>
              <div class="log">
                  <span class="action bold">OPEN</span>
                  <div class="record">
                    <span>${data.operator}</span>
                    <span>${moment(data.beginTime).format("HH:mm:ss")}</span>
                  </div>
                  <span class="diff">$${data.begin.toFixed(2)}</span>
              </div>
              <div>
              ${list}
              </div>
              <div class="log">
                <span class="action bold">CLOSE</span>
                <div class="record">
                  <span>${data.operator}</span>
                  <span>${moment(data.endTime).format("HH:mm:ss")}</span>
                </div>
                <span class="diff">$${data.end.toFixed(2)}</span>
              </div>
              <div class="log last">
                <div class="for">Cash Drawer: ${data.cashDrawer}</div>
              </div>
              <footer>
                <p>Powered by United POS&reg;</p>
              </footer>`;
    const style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
                  section.header{text-align:center;}
                  .header h3{font-size:1.25em;}
                  .header h5{font-size:16px;font-weight:lighter}
                  div.type{margin:10px;}
                  div.type h3{font-weight:lighter;font-size:1.3em;}
                  div.type h5{margin-top:-5px;font-size:1.25em;}
                  .action{min-width:40px;padding:0 10px;}
                  .bold{font-weight:bold}
                  div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                  div.time{border-bottom:1px solid #000;position:relative;}
                  div.log{display:flex;justify-content:center;align-items:center;border-bottom:1px dashed #000;margin:5px 0;padding-bottom: 5px;}
                  .log .record{flex:1;display:flex;flex-direction:column;}
                  .for{text-align:center;font-weight:bold;}
                  .log.last{border-bottom:none;}
                  .diff{width:75px;text-align:right;}
                  footer{border-top:1px solid #000;text-align:center;}</style>`;
    this.plugin.PRINT_INIT('Cash out report');
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
    this.plugin.PRINT();
}

export default cashOut;