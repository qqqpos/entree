const timecard = function (data) {
  const store = this.config;
  const date = moment().format("MM/DD/YYYY");
  const time = moment().format("hh:mm:ss");
  let total = 0;
  const activity = data.activity.map((session, index) => {
    let clockIn = moment(session.clockIn).locale('en').format("hh:mm:ss a");
    let clockOut = moment(session.clockOut).locale('en').format("hh:mm:ss a");
    let h = ("0" + Math.floor(diff / 36e5)).slice(-2) + "  Hr.";
    let m = ("0" + Math.floor(diff / 6e4 % 60)).slice(-2) + "  Min.";

    total += session.clockOut - session.clockIn;

    const diff = ("0" + Math.floor(total / 36e5)).slice(-2) + "  Hr." + ("0" + Math.floor(total / 6e4 % 60)).slice(-2) + "  Min.";

    return `<div class="log">
              <span class="qty">#${index + 1}</span>
              <div class="record">
                <span>${clockIn}</span>
                <span>${clockOut}</span>
              </div>
              <span class="diff">${h} ${m}</span>
            </div>`}).join("").toString();

  const html = `<section class="header">
                  <div class="store">
                    <h3>${store.name}</h3>
                    <h5>${store.address}</h5>
                    <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                    <h5>${store.contact}</h5>
                  </div>
                  <div class="type">
                    <h3>Time Card</h3>
                    <h5>Activity</h5>
                  </div>
                  <div class="time">
                    <span>Date: ${date}</span>
                    <span>Time: ${time}</span>
                  </div>
              </section>
              ${activity}
              <div class="log last">
                <span class="qty"></span>
                <div class="record">Found ${data.activity.length} record(s)</div>
                <span class="diff">${diff}</span>
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
                .qty{width:40px;padding:0 10px;}
                div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                div.time{border-bottom:1px solid #000;position:relative;}
                div.log{display:flex;justify-content:center;align-items:center;border-bottom:1px dashed #000;margin:5px 0;padding-bottom: 5px;}
                .log .record{flex:1;display:flex;flex-direction:column;}
                .log.last{border-bottom:none;}
                .diff{width:75px;text-align:right;}
                footer{border-top:1px solid #000;text-align:center;}</style>`;

  this.plugin.PRINT_INIT('Time card report');
  this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
  this.plugin.PRINT();
}

export default timecard;