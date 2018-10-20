const Tap = {
    install(Vue, options) {
        const opt = Object.assign({ duration: 700 }, options);

        // define variable
        let timer = null;
        let emit = false;

        const start = (e) => {
            console.log("tap trigger")
            if (e.type === 'click' && e.button !== 0) return;

            // reset emit state
            emit = false;

            if (timer === null) {
                timer = setTimeout(() => {
                    emit = true;
                    e.target.dispatchEvent(new CustomEvent('longtap', { 'detail': e }));
                }, opt.duration)
            }
        }

        const cancel = (e) => {
            e.stopPropagation();
            e.preventDefault();

            !emit && e.target.dispatchEvent(new CustomEvent('tap', { 'detail': e }));

            clearTimeout(timer);
            timer = null;
            emit = false;
        }

        // register listener
        document.addEventListener("mousedown", start);
        document.addEventListener("mouseup", cancel);
        document.addEventListener("click", cancel);
    }
}
export default Tap;