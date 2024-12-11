export default function IgnoreResidualParams(ignore = true) {
    return function (target, method, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                const cfg = Object.assign(this.features(method) || {}, {
                    ignoreResidualParams: ignore === true,
                });
                this.features(method, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}