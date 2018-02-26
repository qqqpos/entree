const reserve = function (data) {
    const store = this.config;
    const { queue, name } = data;
    const date = moment().format("MM/DD/YYYY");
    const time = moment().format("hh:mm:ss");
    let html = `<section class="header">
                      <div class="store">
                        <h3>${store.name}</h3>
                        <h5>${store.address}</h5>
                        <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                        <h5>${store.contact}</h5>
                      </div>
                      <div class="type">
                        <h3>Reservation</h3>
                      </div>
                    </section>
                    <section class="data">
                      <h1>${queue}</h1>
                    </section>
                    <footer>
                      <p><span>${date}</span><span class="time">${time}</span></p>
                    </footer>`;

    let style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
        section.header{text-align:center;}
        .header h3{font-size:1.25em;}
        .header h5{font-size:16px;font-weight:lighter}
        div.type{margin:10px;border-bottom:1px solid #000;}
        div.type h3{font-weight:lighter;font-size:1.3em;}
        .data{text-align:center;}h1{font-size:5em;}
        footer{border-top:1px solid #000;text-align:center;}.time{margin-left:10px;}</style>`;
    this.plugin.PRINT_INIT('Reservation Ticket');
    this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
    this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
    this.plugin.PRINT();
}

export default reserve;