export default function RequestHeader(header, value) {
    return function (target, method, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                this.headers(method, header, value);
                return fn.apply(this, arguments);
            };
        }
    };
}