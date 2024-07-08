export default function get(options?: {
    keys: boolean;
}): any;
export default class get {
    constructor(options?: {
        keys: boolean;
    });
    getCollection: () => any;
    getDocument: () => any;
    getDocumentByCriteria: () => any;
    getDocumentByKey: () => any;
}
