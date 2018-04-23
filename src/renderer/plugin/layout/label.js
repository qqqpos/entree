const label = function (device, order) {
    const setting = this.setting[device];
    const { languages } = setting.layout;
    const primary = languages.find(t => t.ref === "usEN");
    const secondary = languages.find(t => t.ref === "zhCN");

    const style = `<style>
                .item{text-align:center;display:inline-block;}
                .number{float:right;}
                .option{text-align:center;font-size:0.8em;font-style:italic;}
                .primary{font-family:'${primary.fontFamily}';font-size:${primary.fontSize};${primary.enable ? '' : 'display:none;'}}
                .secondary{font-family:'${secondary.fontFamily}';word-spacing:1px;font-size:${secondary.fontSize};${secondary.enable ? '' : 'display:none;'}}
                </style>`;


    order.content.filter(item => item.printer[device])
        .map(item => {
            const choiceSet = item.choiceSet.map(set =>
                `<span class="primary">${set.usEN}</span><span class="secondary">${set.zhCN}</span>`
            ).join(" • ").toString();

            return `<div>\
                      <span class="item number"># ${order.number}</span>\
                      <span class="item primary">${item.usEN}</span>\
                      <span class="item secondary">${item.zhCN}</>\
                    </div>\
                <div class="option">${choiceSet}</div>`
        }).forEach(item => {
            this.plugin.PRINT_INIT('Reprint Label');
            this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", item + style);
            this.plugin.SET_PRINTER_INDEX(device);
            this.plugin.PRINT();
        })
}

export default label;