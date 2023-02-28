export default gsheetsAPI;
declare function gsheetsAPI({ apiKey, sheetId, sheetName, sheetNumber, range }: {
    apiKey: any;
    sheetId: any;
    sheetName: any;
    sheetNumber?: number | undefined;
    range?: string | undefined;
}): Promise<any>;
