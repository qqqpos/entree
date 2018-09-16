export default {
    methods: {
        checkAccessPin() {
            return new Promise((next, stop) => {
                if (this.dineInOpt.passwordRequire) {
                    // password required to create new table
                    new Promise((resolve, reject) => {
                        this.componentData = { resolve, reject };
                        this.component = "unlockModule";
                    })
                        .then(operator => {
                            if (operator._id === this.op._id) {
                                // move next if same person
                                next();
                            } else {
                                const prompt = {
                                    type: "question",
                                    title: "dialog.switchOperator",
                                    msg: [
                                        "dialog.switchCurrentOperator",
                                        this.op.name,
                                        operator.name
                                    ]
                                };

                                this.$dialog(prompt)
                                    .then(() => this.switchOperator(operator, next))
                                    .catch(() => {
                                        this.exitComponent();
                                        stop();
                                    });
                            }
                        })
                        .catch(this.pinIncorrectDialog);
                } else {
                    next();
                }
            });
        },
        pinIncorrectDialog(exit) {
            const prompt = {
                title: "dialog.accessDenied",
                msg: "dialog.accessPinNotMatch",
                buttons: [{ text: "button.confirm", fn: "resolve" }]
            };

            exit
                ? this.exitComponent()
                : this.$dialog(prompt).then(this.exitComponent);
        },
        switchOperator(operator, next) {
            this.exitComponent();
            const language = operator.language || "usEN";
            moment.locale(language === "usEN" ? "en" : "zh-cn");

            this.$setLanguage(language);
            this.setApp({ language, newTicket: true });
            this.setOperator(operator);
            next();
        },
        countGuest(table) {
            const defaultGuest = parseInt(table.seat) || 1;

            return new Promise((next, stop) => {
                this.dineInOpt.guestCount
                    ? new Promise((resolve, reject) => {
                        const config = {
                            title: "title.setGuest",
                            subtitle: table.name,
                            type: "number",
                            percentage: false,
                            allowPercentage: false,
                            amount: defaultGuest
                        };
                        this.componentData = Object.assign({ resolve, reject }, config);
                        this.component = "inputModule";
                    })
                        .then(({ amount }) =>
                            next(Object.assign(table, { guest: parseInt(amount) || defaultGuest }))
                        )
                        .catch(() => {
                            stop();
                            this.exitComponent();
                        })
                    : next(Object.assign(table, { guest: defaultGuest }));
            });
        },
        unableViewTicketDialog() {
            const prompt = {
                title: "dialog.permissionDenied",
                msg: "dialog.unableViewOtherTable",
                buttons: [{ text: "button.confirm", fn: "resolve" }]
            };

            this.$dialog(prompt).then(this.exitComponent);
        },
        noFoundDialog(type, _id, session) {
            const prompt = {
                title: "dialog.ticketNotFound",
                msg: "dialog.actionProcess",
                buttons: [
                    { text: "button.resetTable", fn: "reset" },
                    { text: "button.sync", fn: "resolve", load: true },
                    { text: "button.cancel", fn: "reject" }
                ]
            };
            this.$dialog(prompt)
                .then(() => {
                    this.$socket.emit("[ORDER] SYNC", orders => {
                        this.setTodayOrder(orders);
                        this.exitComponent();
                    });
                })
                .catch(reset => {
                    if (reset) {
                        type === "HIBACHI"
                            ? this.$socket.emit("[HIBACHI] RESET", { _id, session })
                            : this.$socket.emit("[TABLE] RESET", { _id });
                    }

                    this.exitComponent();
                });
        }
    }
}