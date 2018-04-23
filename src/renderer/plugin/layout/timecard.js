const timecard = function (data) {
  const store = this.config;
  let content = "";

  data.forEach(employee => {
    const timecards = employee.timecard.filter(t => t.clockOut > t.clockIn);
    content += `
      <section class="report">\
        <h3>Records</h3>\
        <table>\
          <thead>\
            <tr>\
              <th>Clock In</th>\
              <th>Clock Out</th>\
              <th>Hours</th>\
              <th>Tip</th>\
              <th>Pays</th>\
            </tr>\
          </thead>\
          <tbody>\
            ${timecards.map(timecard => `
              <tr>\
                <td>${moment(timecard.clockIn).locale("en").format("MM/DD HH:mm")}</td>\
                <td>${moment(timecard.clockOut).locale("en").format("MM/DD HH:mm")}</td>\
                <td>${timecard.hours.toFixed(2)}</td>\
                <td>${timecard.tip.toFixed(2)}</td>\
                <td>${timecard.unpaid.toFixed(2)}</td>\
              </tr>\
            `).join("").toString()}
          </tbody>\
        </table>\
      </section>\
      <section class="report">\
        <h3>Summary</h3>\
        <p><span class="text">${employee.role} Name</span><span class="value">${employee.name}</span></p>\
        <p><span class="text">Valid Records</span><span class="value">${timecards.length} (${employee.timecard.length})</span></p>\
        <p><span class="text">Work Hours</span><span class="value">${employee.hours.toFixed(2)}</span></p>\
        <p><span class="text">Break Hours</span><span class="value">${employee.breakTime.toFixed(2)}</span></p>\
        <p><span class="text">Total Tips</span><span class="value">${employee.tips.toFixed(2)}</span></p>\
        <p><span class="text">Total Pays</span><span class="value">${employee.unpaid.toFixed(2)}</span></p>\
      </section>`
  })

  const html = `<section class="header">\
                  <div class="store">\
                    <h3>${store.name}</h3>\
                    <h5>${store.address}</h5>\
                    <h5>${store.city} ${store.state} ${store.zipCode}</h5>\
                    <h5>${store.contact}</h5>\
                  </div>\
                  <div class="type">\
                    <h3>Time Card Report</h3>\
                    <h5></h5>\
                  </div>\
              </section>\
                ${content}
              <footer>\
                <p>Powered by United POS&reg;</p>\
              </footer>`;

  const style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}\
                section.header{text-align:center;}\
                .header h3{font-size:1.25em;}\
                .header h5{font-size:16px;font-weight:lighter}\
                div.type{margin:10px;}\
                div.type h3{font-weight:lighter;font-size:1.3em;}\
                div.type h5{margin-top:-5px;font-size:1.25em;}\
                table {width:100%;text-align:center;}\
                p{display:flex;}\
                p span{flex:1;}\
                .report h3{border:1px dashed #000;text-align:center;}\
                .value{text-align:right;}\
                footer{border-top:1px solid #000;}\
                footer p {justify-content: center;}</style>`;

  this.plugin.PRINT_INIT('Time card report');
  this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
  this.plugin.PRINT();
}

export default timecard;