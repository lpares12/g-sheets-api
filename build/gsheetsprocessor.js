"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gsheetsapi_js_1 = __importDefault(require("./gsheetsapi.js"));
function matchValues(valToMatch, valToMatchAgainst, matchingType) {
    try {
        if (typeof valToMatch != 'undefined') {
            valToMatch = valToMatch.toLowerCase().trim();
            valToMatchAgainst = valToMatchAgainst.toLowerCase().trim();
            if (matchingType === 'strict') {
                return valToMatch === valToMatchAgainst;
            }
            if (matchingType === 'loose') {
                return (valToMatch.includes(valToMatchAgainst) ||
                    valToMatch == valToMatchAgainst);
            }
        }
    }
    catch (e) {
        console.log("error in matchValues: ".concat(e.message));
        return false;
    }
    return false;
}
function filterResults(resultsToFilter, filter, options) {
    var filteredData = [];
    // now we have a list of rows, we can filter by various things
    return resultsToFilter.filter(function (item) {
        // item data shape
        // item = {
        //   'Module Name': 'name of module',
        //   ...
        //   Department: 'Computer science'
        // }
        var addRow = null;
        var filterMatches = [];
        if (typeof item === 'undefined' ||
            item.length <= 0 ||
            Object.keys(item).length <= 0) {
            return false;
        }
        Object.keys(filter).forEach(function (key) {
            var filterValue = filter[key]; // e.g. 'archaeology'
            // need to find a matching item object key in case of case differences
            var itemKey = Object.keys(item).find(function (thisKey) { return thisKey.toLowerCase().trim() === key.toLowerCase().trim(); });
            var itemValue = item[itemKey]; // e.g. 'department' or 'undefined'
            filterMatches.push(matchValues(itemValue, filterValue, options.matching || 'loose'));
        });
        if (options.operator === 'or') {
            addRow = filterMatches.some(function (match) { return match === true; });
        }
        if (options.operator === 'and') {
            addRow = filterMatches.every(function (match) { return match === true; });
        }
        return addRow;
    });
}
function processGSheetResults(JSONResponse, returnAllResults, filter, filterOptions, isRanged) {
    var data = JSONResponse.values;
    var startRow = 1; // skip the header row(1), don't need it
    if (isRanged) {
        //When there is a range, return uncurated
        return data;
    }
    var processedResults = [{}];
    var colNames = {};
    for (var i = 0; i < data.length; i++) {
        // Rows
        var thisRow = data[i];
        for (var j = 0; j < thisRow.length; j++) {
            // Columns/cells
            var cellValue = thisRow[j];
            var colNameToAdd = colNames[j]; // this will be undefined on the first pass
            if (i < startRow) {
                colNames[j] = cellValue;
                continue; // skip the header row
            }
            if (typeof processedResults[i] === 'undefined') {
                processedResults[i] = {};
            }
            if (typeof colNameToAdd !== 'undefined' && colNameToAdd.length > 0) {
                processedResults[i][colNameToAdd] = cellValue;
            }
        }
    }
    // make sure we're only returning valid, filled data items
    processedResults = processedResults.filter(function (result) { return Object.keys(result).length; });
    // if we're not filtering, then return all results
    if (returnAllResults || !filter) {
        return processedResults;
    }
    return filterResults(processedResults, filter, filterOptions);
}
var gsheetProcessor = function (options, callback, onError) {
    var apiKey = options.apiKey, sheetId = options.sheetId, sheetName = options.sheetName, sheetNumber = options.sheetNumber, returnAllResults = options.returnAllResults, filter = options.filter, filterOptions = options.filterOptions, range = options.range;
    if (!options.apiKey || options.apiKey === undefined) {
        throw new Error('Missing Sheets API key');
    }
    return (0, gsheetsapi_js_1.default)({
        apiKey: apiKey,
        sheetId: sheetId,
        sheetName: sheetName,
        sheetNumber: sheetNumber,
        range: range
    })
        .then(function (result) {
        var filteredResults = processGSheetResults(result, returnAllResults || false, filter || false, filterOptions || {
            operator: 'or',
            matching: 'loose'
        }, (range) ? true : false);
        callback(filteredResults);
    })
        .catch(function (err) { return onError(err.message); });
};
exports.default = gsheetProcessor;
