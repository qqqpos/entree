const net = require('net');

const Exadigm = function () {
    let host = null;
    let port = null;
    let auth = null;
    let station = null;
    let terminal = null;

    this.initial = function (ip, pt, authCode, alias, device) {
        host = ip;
        port = pt || 8765;
        auth = authCode || "987pjasd4687";
        station = alias;
        terminal = device || "Exadigm";

        return new Promise((next) => next({ code: "000000", model: "NX2200" }));
    };

    this.check = (device) => ({ code: "000000", model: "NX2200" });

    this.charge = function ({ amount, creditCard, tip }) {
        let command = null;

        if (creditCard.date && creditCard.number) {
            command = {
                "packetID": "XCRP",
                "packetData": {
                    "packetAuthorization": auth,
                    "requestID": 4,
                    "baseAmount": amount * 100,
                    "receiptCount": 0,
                    "transactionType": 0,
                    "taxAmount": 0,
                    "tipAmount": tip * 100
                }
            }
        } else {
            command = {
                "packetID": "XCRP",
                "packetData": {
                    "packetAuthorization": auth,
                    "requestID": 4,
                    "baseAmount": amount * 100,
                    "receiptCount": 0,
                    "transactionType": 0,
                    "taxAmount": 0,
                    "tipAmount": tip * 100
                }
            };
        }
        return new Promise((resolve, reject) => {
            this.sent(command).then(response => resolve({ data: response.packetData })).catch(error => reject({ data: error }))
        })
    };

    this.explainTransaction = function (data) {
        console.log(data);
        const { packetData } = data;
        const transType = ["SALES"]
        return {
            code:'000000',
            resMsg: packetData.resultCode,
            host: {
                code: packetData.resultCode,
                msg: packetData.hostMessage,
                auth: packetData.authorizationCode,
                ref: packetData.referenceNumber,
                trace: "",
                batch: packetData.batchID
            },
            transType: "",
            amount: {
                approve: (packetData.baseAmount / 100).toFixed(2),
                due: "0.00",
                tip: (packetData.tipAmount / 100).toFixed(2),
                cashBack: (packetData.cashbackAmount / 100).toFixed(2),
                fee: (packetData.feeAmount / 100).toFixed(2),
                tax: "0.00",
                balance: "0.00"
            },
            account: {
                number: packetData.cardNumber,
                entry: packetData.cardDataEntry,
                exp: "",
                type: packetData.cardIssuer,
                holder: packetData,
                present: packetData.cardDataEntry ? 'Present' : 'Not Present'
            },
            trace: {
                trans: packetData.transactionID,
                ref: packetData.referenceNumber,
                time: packetData.transactionTime
            },
            device:{},
            station,
            terminal,
            addition:null,
            time: +new Date,
            status: 1
        };
    };

    this.sent = function (command) {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();

            //socket.setEncoding("utf8");
            socket.connect(port, host, () => socket.write(JSON.stringify(command)));

            let buffer = null;

            socket.on('data', (data) => {
                console.log(data);
                buffer = data;
                socket.destroy();
            });

            socket.on('error', (error) => reject(error));
            socket.on('close', () => resolve(JSON.parse(buffer)));
        })
    }
};

export default function () {
    return new Exadigm();
}