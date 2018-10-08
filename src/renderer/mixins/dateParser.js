import moment from "moment";

export default {
    methods: {
        dateRange(string, date) {
            let from, to;

            switch (string) {
                case "TODAY":
                    // regular starts from 4:00 am to next day 3:59:59 am
                    from = moment().startOf('day').set({
                        hour: 4
                    });

                    to = moment().add(1, 'days').startOf('day').set({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "YESTERDAY":
                    from = moment().subtract(1, 'days').startOf('day').set({
                        hour: 4
                    });

                    to = moment().startOf('day').set({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "CURRENT_WEEK":
                    from = moment().startOf('week').set({
                        hour: 4
                    });

                    to = moment().endOf('week').add({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "LAST_WEEK":
                    from = moment().subtract(1, 'week').startOf('week').set({
                        hour: 4
                    });

                    to = moment().startOf('week').set({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "CURRENT_MONTH":
                    from = moment().startOf('month').set({
                        hour: 4
                    });

                    to = moment().endOf('month').add({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "LAST_MONTH":
                    from = moment().subtract(1, 'month').startOf('month').set({
                        hour: 4
                    });

                    to = moment().subtract(1, 'month').endOf('month').add({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "CURRENT_QUARTER":
                    from = moment().startOf('quarter').set({
                        hour: 4
                    });

                    to = moment().endOf('quarter').add({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });

                    break;
                case "LAST_QUARTER":
                    from = moment().subtract(1, 'quarter').startOf('quarter').set({
                        hour: 4
                    });

                    to = moment().subtract(1, 'quarter').endOf('quarter').add({
                        hour: 3,
                        minute: 59,
                        second: 59
                    });
                    break;
                case "CUSTOM":
                    break;
                case "SESSION":
                    const today = moment().format("YYYY-MM-DD");
                    from = new Date(today + " " + date.from);
                    to = new Date(today + " " + date.to);
                default:

            }
            return {
                from: +from,
                to: +to
            }
        }
    }
}