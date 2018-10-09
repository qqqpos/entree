const axios = require("axios");

const Pax = function () {
  let device = null;
  let station = null;
  let request = null;
  let terminal = null;

  this.initial = function (ip, port, sn, stationAlias, terminalAlias) {
    if (!ip || !port) throw new Error("CONFIG_FILE_ERROR");

    station = stationAlias || '';
    terminal = terminalAlias || '';

    request = axios.create({
      baseURL: `http://${ip}:${port}`
    });

    request.interceptors.response.use((response) => {
      return response;
    }, (error) => {
      return Promise.reject(error);
    });

    const command = Encode("A00_1.38");
    return request.get(command);
  };

  this.check = function (d) {
    try {
      let data = d.split(String.fromCharCode(28));
      let sn = data[5] ? data[5].replace(/[^a-z0-9]/gi, '') : "";
      let msg = data[4].indexOf(String.fromCharCode(3) !== -1) ? data[4].split(String.fromCharCode(3))[0] : data[4];
      device = {
        msg,
        sn,
        code: data[3],
        model: data[6],
        mac: data[8]
      };
    } catch (e) {
      device = {
        code: "999999",
        msg: "parseError"
      }
    }

    return device;
  };
  this.charge = function (data) {
    const {
      number,
      date
    } = data.creditCard;
    const amount = toFixed(data.amount * 100, 0);
    const tip = toFixed(data.tip * 100, 0);
    let command;

    if (number && date) {
      const info = `${number}|${date}|`;
      command = Encode(`T00_1.38_01_${amount}_${info}_1_____`)
    } else {
      command = Encode(`T00_1.38_01_${amount}|${tip}|__1_____`)
    }

    return request.get(command)
  };
  this.explainTransaction = function (raw) {
    // Remove STX ETX LRC from T01 response
    const [multiple, command, version, code, resMsg, hostInfo, type, amountInfo, accountInfo, traceInfo, avsInfo, commInfo, eCommInfo, additional] = raw.slice(1, -2).split(String.fromCharCode(28));

    switch (code) {
      case "000000":
        const [hostResCode, hostResMsg, authCode, hostRefNum, traceNum, batchNum] = hostInfo.split(String.fromCharCode(31));
        const [transNum, refNum, timestamp] = traceInfo.split(String.fromCharCode(31));

        // balance 1 is cash benefits balance
        // balance 2 is food stamp balance
        const [approve, due, tip, cashBack, merchantFee, tax, balance, available] = amountInfo.split(String.fromCharCode(31));
        const [cardNum, entry, exp, , , , cardType, cardHolder, , , present] = accountInfo.split(String.fromCharCode(31));
        //const [avsApprovalCode, avsMsg] = avsInfo.split(String.fromCharCode(31));
        //const [poNum, customerCode, taxExempt, taxExemptID, merchantTaxID, destinationZipCode, productDescription] = commInfo.split(String.fromCharCode(31));

        const transTypes = ['MENU', 'SALE', 'RETURN', 'AUTH', 'POSTAUTH', 'FORCED', 'ADJUST', 'WITHDRAWAL', 'ACTIVATE', 'ISSUE', 'ADD', 'CASHOUT', 'DEACTIVATE', 'REPLACE', 'MERGE', 'REPORTLOST', 'VOID', 'VOID/SALE', 'VOID/RTRN', 'VOID/AUTH', 'VOID/POST', 'VOID/FORCE', 'VOID/WITHDRAW', 'BALANCE', 'VERIFY', 'REACTIVATE', 'FORCED ISSUE', 'FORCE ADD', 'UNLOAD', 'RENEW', 'GET CONVT DETAIL', 'CONVERT', 'TOKENIZE', 'INCREMENTAL AUTH', 'BALANCE w.LOCK', 'REDEMPTION w.UNLOCK'];
        const cardTypes = ['', 'Visa', 'Master', 'AmEx', 'Discover', 'Diner Club', 'enRoute', 'JCB', 'Revolution', 'Visa Fleet', 'MasterCard Fleet', 'FleetOne', 'Fleetwide', 'Fuelman', 'Gascard', 'Voyager', 'Wright Exp']
        const modes = ['Manual', 'Swipe', 'Contactless', 'Scanner', 'Chip', 'Chip Fall Back Swipe'];

        let extraInfo = {};
        additional.split(String.fromCharCode(0x03))[0].split(String.fromCharCode(31)).forEach(data => {
          const key = data.split("=")[0];
          const value = data.split("=")[1];
          extraInfo[key] = value;
        });

        return {
          code,
          resMsg,
          host: {
            code: hostResCode,
            msg: hostResMsg,
            auth: authCode,
            ref: hostRefNum,
            trace: traceNum,
            batch: batchNum
          },
          transType: transTypes[~~type] || 'REVERSAL',
          amount: {
            approve: (approve / 100).toFixed(2),
            due: (due / 100).toFixed(2),
            tip: (tip / 100).toFixed(2),
            cashBack: (cashBack / 100).toFixed(2),
            fee: (merchantFee / 100).toFixed(2),
            tax: (tax / 100).toFixed(2),
            balance: (balance / 100).toFixed(2),
            available: (available / 100).toFixed(2)
          },
          account: {
            number: cardNum,
            entry: modes[entry],
            exp,
            type: cardTypes[~~cardType] || 'Other',
            holder: cardHolder,
            present: present ? 'Present' : 'Not Present'
          },
          trace: {
            trans: transNum,
            ref: refNum,
            time: timestamp
          },
          device,
          station,
          terminal,
          addition: extraInfo,
          time: Date.now(),
          status: 1
        }
      case "100001":
        return {
          code,
          msg: 'terminal.creditCard.timeout'
        }
      case "100002":
        return {
          code,
          msg: 'terminal.creditCard.aborted'
        }
      case "100003":
        const error = data[4].split(String.fromCharCode(3))[0];
        return {
          code,
          msg: 'terminal.creditCard.errorCode',
          error,
        }
      case "100004":
        return {
          code,
          msg: 'terminal.creditCard.unsupportedTrans'
        }
      case "000100":
        return {
          code,
          msg: 'terminal.creditCard.declined'
        }
      case "100010":
        return {
          code,
          msg: 'terminal.creditCard.commError'
        }
      case "100011":
        return {
          code,
          msg: 'terminal.creditCard.duplicated'
        }
      case "100019":
        return {
          code,
          msg: 'terminal.creditCard.badTrack'
        }
      case "100021":
        return {
          code,
          msg: 'terminal.creditCard.void'
        }
      case "100023":
        return {
          code,
          msg: 'terminal.creditCard.notFound'
        }
      default:
        return {
          code,
          msg: "terminal.creditCard.unknown"
        }
    }
  }
  this.getLocalReport = function () {
    const command = Encode(`R00_1.26_01_`);
    return request.get(command)
  }

  this.explainBatch = function (raw) {
    // Remove STX ETX LRC from B01 response
    const [multiple, command, version, code, message, host, totalCount, totalAmount, time, tid, mid, addition] = raw.slice(1, -2).split(String.fromCharCode(28));

    switch (code) {
      case "000000":
        const [hostResCode, hostResMsg, authCode, hostRefNum, traceNum, batchNum] = host.split(String.fromCharCode(31));
        const [creditCount, debitCount, ebtCount] = totalCount.split("=");
        const amount = totalAmount.split("=");

        return {
          code,
          resMsg: hostResMsg,
          date: today(),
          time,
          tid,
          mid,
          device,
          station,
          terminal,
          count: {
            credit: creditCount,
            debit: debitCount,
            ebt: ebtCount
          },
          amount: {
            credit: (amount[0] / 100).toFixed(2),
            debit: (amount[1] / 100).toFixed(2),
            ebt: (amount[2] / 100).toFixed(2)
          },
          result: hostResMsg,
          batch: batchNum,
          status: 1
        }
      case "000100":
        return {
          code,
          msg: 'terminal.batch.declined'
        }
      case "100001":
        return {
          code,
          msg: 'terminal.batch.timeout'
        }
      case "100002":
        return {
          code,
          msg: 'terminal.batch.aborted'
        }
      case "100003":
        return {
          code,
          msg: 'terminal.batch.paramsInvalid'
        }
      case "100004":
        return {
          code,
          msg: 'terminal.batch.unsupported'
        }
      case "100005":
        return {
          code,
          msg: 'terminal.batch.unsupportedEDC'
        }
      case "100006":
        return {
          code,
          msg: 'terminal.batch.failed'
        }
      case "100007":
        return {
          code,
          msg: 'terminal.batch.connectError'
        }
      case "100008":
        return {
          code,
          msg: 'terminal.batch.sendError'
        }
      case "100009":
        return {
          code,
          msg: 'terminal.batch.receiveError'
        }
      case "100010":
        return {
          code,
          msg: 'terminal.batch.commError'
        }
      case "100011":
        return {
          code,
          msg: 'terminal.batch.duplicated'
        }
      case "100023":
        return {
          code,
          msg: 'terminal.batch.noFound'
        }
      case "199999":
        return {
          code,
          msg: 'terminal.batch.error'
        }
      default:
        return {
          code,
          msg: 'terminal.batch.unknown'
        }
    }
  }
  this.abort = function () {
    //Encode(`A14_1.38`);

  }
  this.command = function (command) {
    return request.get(Encode(command))
  }

  this.retrieveTransactionDetail = function () {
    const command = Encode("R02_1.38_01____0__");
    return request.get(command);
  }

  this.doSignature = function () {
    const command = Encode(`A20_1.38_0_0_01_200`);
    return request.get(command)
  }

  this.getSignature = function () {
    const command = Encode(`A08_1.38_0_`);
    return request.get(command)
  }

  this.drawSignature = function (path) {
    console.log(path);
    let canvas = document.createElement('canvas');

    // pax signature has default size 170 * 100
    canvas.width = 170;
    canvas.height = 100;

    let context = canvas.getContext('2d');
    let draws = path.split("0,65535").slice(1);

    draws.forEach(draw => {
      draw.split("^").slice(1, -1).forEach((coordinate, index) => {
        if (!coordinate.includes(",")) return;

        const [x, y] = coordinate.split(",");
        index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        context.stroke();
      })
    })

    const data = canvas.toDataURL();
    // Free memory
    canvas = null;

    return data;
  }
  this.adjust = function (invoice, trans, value) {
    const command = Encode(`T00_1.38_06_${value}__${invoice}|||${trans}______`);
    return request.get(command)
  }
  this.voidSale = function (invoice, trans) {
    const command = Encode(`T00_1.38_16___${invoice}|||${trans}______`);
    return request.get(command)
  }
  this.refund = function (amount, ticket) {
    amount = amount * 100
    const command = Encode(`T00_1.38_02_${amount}__${ticket}______`);
    return request.get(command)
  }
  this.report = function () {
    const command = Encode('R00_1.38_00_')
  }
  this.batch = function () {
    const command = Encode('B00_1.38_');
    return request.get(command)
  }

  // functional 
  this.reboot = function () {
    const command = Encode(`A26_1.38`);
    return request.get(command)
  }
};

const Encode = function (d) {
  const char = c => String.fromCharCode(c);

  d = d.replace(/[_]/g, char(0x1c));
  d = d.replace(/[|]/g, char(0x1f));

  return char(0x3F) + new Buffer(char(0x02) + d + char(0x03) + lrc(d + char(0x03))).toString('base64');
};

const Decode = function (d) {
  d = new Buffer(d, 'base64').toString();
  let e, i = 0;
  for (; i < d.length; i++) {
    if (d.charCodeAt(i) === 3) {
      e = i;
      break;
    }
  }
  return d.slice(1, e).split(String.fromCharCode(28));
};

const lrc = function (s) {
  let l = s.charCodeAt(0);
  for (let i = 1; i < s.length; i++) {
    l ^= s.charCodeAt(i);
  }
  return String.fromCharCode(l);
};

export default function () {
  return new Pax();
}