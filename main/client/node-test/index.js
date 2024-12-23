import swc from "@swc/core";
import * as fs from "node:fs";

swc.transformFile("./test.ts", {
        sourceMaps: false,
        isModule: true,
        jsc: {
            parser: {
                syntax: "typescript",
                decorators: true,
            },
            transform: {
                legacyDecorator: true,
                decoratorMetadata: true
            },
            target: 'es5'
        },
    })
    .then((output) => {
        fs.writeFileSync("./test.js", output.code);
    });