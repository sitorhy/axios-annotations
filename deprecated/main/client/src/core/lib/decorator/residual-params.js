export default function IgnoreResidualParams(registration) {
    return function (target, name, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                this.for(name, registration);
                return fn.apply(this, arguments);
            };
        }
    };
}