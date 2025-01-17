"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var gsheetsAPI = function (_a) {
    var apiKey = _a.apiKey, sheetId = _a.sheetId, sheetName = _a.sheetName, _b = _a.sheetNumber, sheetNumber = _b === void 0 ? 1 : _b, _c = _a.range, range = _c === void 0 ? '' : _c;
    try {
        var sheetNameStr = sheetName && sheetName !== '' ? encodeURIComponent(sheetName) : "Sheet".concat(sheetNumber);
        var rangeStr = range !== '' ? '!' + range : '';
        var sheetsUrl = "https://sheets.googleapis.com/v4/spreadsheets/".concat(sheetId, "/values/").concat(sheetNameStr).concat(rangeStr, "?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=").concat(apiKey);
        return (0, cross_fetch_1.default)(sheetsUrl)
            .then(function (response) {
            if (!response.ok) {
                console.log('there is an error in the gsheets response');
                throw new Error('Error fetching GSheet');
            }
            return response.json();
        })
            .then(function (data) { return data; })
            .catch(function (err) {
            throw new Error('Failed to fetch from GSheets API. Check your Sheet Id and the public availability of your GSheet.');
        });
    }
    catch (err) {
        throw new Error("General error when fetching GSheet: ".concat(err));
    }
};
exports.default = gsheetsAPI;
