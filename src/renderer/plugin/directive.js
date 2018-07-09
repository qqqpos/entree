const Mask = {
    bind(el, binding) {
        function verify(number) {
            if (number.length >= 15) {
                const valid = (function (arr) {
                    return function (card) {
                        let len = card.length;
                        let bit = 1;
                        let sum = 0;
                        let val;

                        while (len) {
                            val = parseInt(card.charAt(--len), 10);
                            sum += (bit ^= 1) ? arr[val] : val;
                        }

                        return sum && sum % 10 === 0;
                    };
                }([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]))(number);

                el.dataset.valid = valid;

                if (binding.modifiers.check)
                    valid ? el.classList.remove("invalid") : el.classList.add("invalid");

            } else {
                el.classList.remove("invalid");
            }
        }

        el.expressionHandler = value => {

        };
        el.cardHandler = value => {
            const card = value.replace(/\s/g, "");
            const group = card.match(/(\d{1,4})/g);
            if (group) {
                verify(card);

                el.value = group.slice(0, 4).join(" ");
            }
        };
        el.dateHandler = value => {
            const date = value.replace(/\D+/g, "").substring(0, 4);
            const group = date.match(/(\d{1,2})/g);
            if (group) {
                el.value = group.slice(0, 2).join(" / ");
                if (date.length === 4 && binding.modifiers.check) {
                    const [YY, MM] = moment().format("YY,MM").split(",");
                    const [mm, yy] = group;

                    (YY + MM < yy + mm) ? el.classList.remove("invalid") : el.classList.add("invalid");
                } else {
                    el.classList.remove("invalid")
                }
            }
        };

        const inputHandler = (event) => {
            const { card, date, expression } = binding.modifiers;
            const value = String(event.target.value);

            if (expression) {
                el.expressionHandler(value)
            } else if (card) {
                el.cardHandler(value)
            } else if (date) {
                el.dateHandler(value)
            }
        }
        el.addEventListener('input', inputHandler);
        el.$destroy = () => el.removeEventListener('input', inputHandler)
    },
    update(el, binding) {
        const { card, date, expression } = binding.modifiers;
        const value = String(el.value);

        if (expression) {
            el.expressionHandler(value)
        } else if (card) {
            el.cardHandler(value);
            el.dispatchEvent(new Event('input'))
        } else if (date) {
            el.dateHandler(value);
            el.dispatchEvent(new Event('input'))
        }
    },
    unbind(el) {
        el.$destroy();
    }
}

const OuterClick = {
    bind: function (el, binding, vNode) {
        if (typeof binding.value !== "function") {
            const component = vNode.context.name;
            let warn = `[Vue-outer-click:] provided expression '${
                binding.expression
                }' is not a function.`;
            if (component) {
                warn += `Found in component '${component}'`;
            }
            console.warn(warn);
        }
        const { bubble } = binding.modifiers;
        const handler = e => {
            if (bubble || (!el.contains(e.target) && el !== e.target)) {
                binding.value(e);
            }
        };
        el.__vueOuterClick__ = handler;
        document.addEventListener("click", handler);
    },

    unbind: function (el, binding) {
        document.removeEventListener("click", el.__vueOuterClick__);
        el.__vueOuterClick__ = undefined;
    }
}

export { Mask, OuterClick }
