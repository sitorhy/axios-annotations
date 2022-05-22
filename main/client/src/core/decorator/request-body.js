export default function RequestBody(name = "body") {
    return function (target, method, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            const cfg = {
                required: false,
                body: true
            };
            descriptor.value = function () {
                this.params(method, name, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}