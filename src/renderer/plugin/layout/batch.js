const batch = function(data, detail) {
  const store = this.config;
  const batchTime = moment(Number(data.time), "YYYYMMDDHHmmss");
  const date = batchTime.format("MM/DD/YYYY");
  const time = batchTime.format("hh:mm:ss");
  const { credit, debit, ebt } = data.amount;
  const total = (
    parseFloat(credit) +
    parseFloat(debit) +
    parseFloat(ebt)
  ).toFixed(2);
  const category = detail
    ? `
    <section class="data">
      <h3>Transaction</h3>
      ${detail
        .map(
          each => `<p>\
                    <span class="text">${each.type}</span>\
                    <span class="value">${each.amount}</span>\
                  </p>`
        )
        .join("")
        .toString()}
    </section>
  `
    : "";
  const html = `<article>\
                <section class="data">\
                <h3>Batch Report</h3>\
                  <p class="time">
                    <span class="text">${date}</span><span class="value">${time}</span>
                  </p>\
                  <p>\
                    <span class="text">Merchant ID</span>\
                    <span class="value">${data.mid}</span>\
                  </p>\
                  <p>\
                    <span class="text">Terminal ID</span>\
                    <span class="value">${data.tid}</span>\
                  </p>\
                  <p>\
                    <span class="text">Terminal</span>\
                    <span class="value">${data.terminal}</span>\
                  </p>\
                  <p>\
                    <span class="text">Batch #</span>\
                    <span class="value">${data.batchNumber}</span>\
                  </p>\
                  <p>\
                    <span class="text">Result</span>\
                    <span class="value">${data.resMsg}</span>\
                  </p>\
                  <p>\
                    <span class="text">Total</span>\
                    <span class="value">$ ${total}</span>\
                  </p>\
                </section>\
                ${category}
                <section class="data">\
                  <h3>Overview</h3>\
                  <p>\
                    <span class="text">Credit ( ${data.count.credit} )</span>\
                    <span class="value">$ ${data.amount.credit}</span>\
                  </p>\
                  <p>\
                    <span class="text">Debit ( ${data.count.debit} )</span>\
                    <span class="value">$ ${data.amount.debit}</span>\
                  </p>\
                </section>\
              </article>\
              <footer>\
                <p>END OF BATCH REPORT</p>\
                <p>Powered By United POS&reg;</p>\
              </footer>`;
  const style = `<style>
              *{margin:0;padding:0;font-family:'Agency FB';}
              article p{display:flex;}
              article .text{flex:2;}
              article .value{flex:4;text-align:right}
              section.data{margin:15px 0;}
              .data h3{border-bottom:1px dashed #000;text-align:center;}
              footer{text-align:center;}`;

  this.plugin.PRINT_INIT("Batch Report");
  this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.plugin.SET_PRINTER_INDEX(this.station.receipt || "cashier");
  this.plugin.PRINT();
};

export default batch;
