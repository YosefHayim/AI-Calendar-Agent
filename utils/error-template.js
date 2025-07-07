"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorFn = function (message, status, res) {
    var error = new Error(message, { cause: { status: status } });
    if (res) {
        res === null || res === void 0 ? void 0 : res.status(status).json({
            status: 'error',
            code: status,
            message: error.message,
        });
    }
    throw Error(message, { cause: { status: status } });
};
exports.default = errorFn;
