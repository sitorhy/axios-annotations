export default function RequestParam(name, required = false) {
    return function (target, method, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            const cfg = Object.assign({
                required: false,
                body: false
            }, {
                required: required === true
            });
            descriptor.value = function () {
                this.params(method, name, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}