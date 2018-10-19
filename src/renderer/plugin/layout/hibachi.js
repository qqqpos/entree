const hibachi = function (printer, order, items) {
    const layout = {
        left: [{
            seat: 7,
            rect: [196, 8, 62, 140, 0, 1],
            number: [395, 54, 130, 34, "7"],
            text: [330, 20, 130, 34]
        }, {
            seat: 8,
            rect: [196, 70, 62, 140, 0, 1],
            number: [395, 117, 130, 34, "8"],
            text: [330, 80, 130, 34]
        }, {
            seat: 9,
            rect: [196, 131, 62, 140, 0, 1],
            number: [395, 178, 130, 34, "9"],
            text: [330, 142, 130, 34]
        }, {
            seat: 10,
            rect: [196, 193, 62, 140, 0, 1],
            number: [394, 241, 130, 34, "10"],
            text: [330, 205, 130, 34]
        }, {
            seat: 6,
            rect: [335, 8, 62, 140, 0, 1],
            number: [533, 54, 130, 34, "6"],
            text: [470, 20, 130, 34]
        }, {
            seat: 5,
            rect: [474, 8, 62, 140, 0, 1],
            number: [673, 54, 130, 34, "5"],
            text: [610, 20, 130, 34]
        }, {
            seat: 4,
            rect: [613, 8, 62, 140, 0, 1],
            number: [812, 54, 130, 34, "4"],
            text: [750, 20, 130, 34]
        }, {
            seat: 3,
            rect: [613, 70, 62, 140, 0, 1],
            number: [812, 116, 130, 34, "3"],
            text: [750, 80, 130, 34]
        }, {
            seat: 2,
            rect: [613, 131, 62, 140, 0, 1],
            number: [812, 177, 130, 34, "2"],
            text: [750, 142, 130, 34]
        }, {
            seat: 1,
            rect: [613, 193, 62, 140, 0, 1],
            number: [811, 240, 130, 34, "1"],
            text: [750, 205, 130, 34]
        }],
    
        right: [{
            seat: 10,
            rect: [196, 8, 62, 140, 0, 1],
            number: [138, 22, 130, 34, "10"],
            text: [199, 65, 130, 34]
        }, {
            seat: 9,
            rect: [196, 70, 62, 140, 0, 1],
            number: [137, 84, 130, 34, "9"],
            text: [199, 126, 130, 34]
        }, {
            seat: 8,
            rect: [196, 131, 62, 140, 0, 1],
            number: [137, 146, 130, 34, "8"],
            text: [199, 187, 130, 34]
        }, {
            seat: 7,
            rect: [196, 193, 62, 140, 0, 1],
            number: [137, 208, 130, 34, "7"],
            text: [199, 248, 130, 34]
        }, {
            seat: 6,
            rect: [335, 193, 62, 140, 0, 1],
            number: [277, 208, 130, 34, "6"],
            text: [342, 248, 130, 34]
        }, {
            seat: 5,
            rect: [474, 193, 62, 140, 0, 1],
            number: [416, 208, 130, 34, "5"],
            text: [480, 248, 130, 34]
        }, {
            seat: 1,
            rect: [613, 8, 62, 140, 0, 1],
            number: [553, 24, 130, 34, "1"],
            text: [618, 65, 130, 34]
        }, {
            seat: 2,
            rect: [613, 70, 62, 140, 0, 1],
            number: [554, 86, 130, 34, "2"],
            text: [618, 126, 130, 34]
        }, {
            seat: 3,
            rect: [613, 131, 62, 140, 0, 1],
            number: [554, 148, 130, 34, "3"],
            text: [618, 187, 130, 34]
        }, {
            seat: 4,
            rect: [613, 193, 62, 140, 0, 1],
            number: [554, 208, 130, 34, "4"],
            text: [618, 248, 130, 34]
        }]
    };
    
    const { name, address, city, state, zipCode, contact } = this.config;
    this.plugin.PRINT_INITA(0, 0, 260, 2000, 'Ticket Hibachi');
    this.plugin.ADD_PRINT_TEXT(3, 2, 262, 23, name);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.ADD_PRINT_TEXT(30, 2, 262, 20, address);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.ADD_PRINT_TEXT(42, 2, 262, 20, `${city}, ${state} ${zipCode}`);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.ADD_PRINT_TEXT(60, 2, 262, 20, contact);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.ADD_PRINT_TEXT(76, 88, 100, 21, "HIBACHI");
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
    this.plugin.ADD_PRINT_TEXT(96, 200, 250, 21, order.table);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
    this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
    this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
    this.plugin.ADD_PRINT_TEXT(120, 30, 150, 20, "Time: " + moment(order.time).format('MM-DD HH:mm'));
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
    this.plugin.ADD_PRINT_TEXT(120, 150, 100, 20, "Server: " + order.server);
    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
    this.plugin.ADD_PRINT_LINE(138, 6, 138, 266, 0, 1);

    layout[order.layout].forEach(table => {
        const item = items.find(i => i.seat === table.seat);
        const turn = order.layout === 'left' ? 90 : -90;

        if (item && item.printer[printer]) {
            const { replace = false, usEN } = item.printer[printer];
            const name = replace ? usEN : item.usEN;

            console.log(name);

            let food = name + "\n" + (item.side.usEN ? item.side.usEN + "\n" : "")

            item.choiceSet.forEach(set => { food += set.usEN + " " });
            table.text.push(food);
        }

        this.plugin.ADD_PRINT_RECT(...table.rect);
        this.plugin.ADD_PRINT_TEXT(...table.number);
        this.plugin.SET_PRINT_STYLEA(0, "Angle", turn);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Roboto Condensed");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.ADD_PRINT_TEXT(...table.text);
        this.plugin.SET_PRINT_STYLEA(0, "Angle", turn);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Microsoft YaHei");
        this.plugin.SET_PRINT_STYLEA(0, "LineSpacing", -6);
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
    });

    this.plugin.SET_PRINTER_INDEX(printer)
    this.plugin.PRINT();
}

export default hibachi;