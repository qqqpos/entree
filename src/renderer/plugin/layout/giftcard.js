const giftcard = function(title, card, { bonus = 0, reload = 0 }) {
  const { name, address, city, state, zipCode, contact } = this.config;

  this.plugin.PRINT_INIT("Gift Card");
  this.plugin.PRINT_INITA(0, 0, 260, 2000, "");
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
  this.plugin.ADD_PRINT_TEXT(76, 88, 100, 21, "Gift Card");
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
  this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
  this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_TEXT(96, 88, 100, 21, title);
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
  this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
  this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_TEXT(
    120,
    42,
    110,
    20,
    "Date: " + moment().format("MM-DD-YYYY")
  );
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_TEXT(
    120,
    145,
    110,
    20,
    "Time: " + moment().format("HH:mm:ss")
  );
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_LINE(138, 6, 138, 266, 0, 1);
  this.plugin.ADD_PRINT_TEXT(152, 2, 262, 20, "THANK YOU");
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.ADD_PRINT_TEXT(
    178,
    2,
    262,
    20,
    reload ? `Reload: $${reload.toFixed(2)}` : `Amount: ${card.balance.toFixed(2)}`
  );
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_TEXT(
    204,
    2,
    262,
    20,
    bonus ? `Bonus: $${bonus.toFixed(2)}` : ""
  );
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_TEXT(
    230,
    2,
    262,
    20,
    "BALANCE: $ " + card.balance.toFixed(2)
  );
  this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
  this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
  this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
  this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
  this.plugin.ADD_PRINT_BARCODE(302, 30, 266, 70, "Code39", card.number);
  this.plugin.SET_PRINTER_INDEX(this.station.receipt || "cashier");
  this.plugin.PRINT();
};

export default giftcard;
