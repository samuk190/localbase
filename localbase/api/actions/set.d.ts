export default function set(newDocument: any, options?: {
    keys: boolean;
}): any;
export default class set {
    constructor(newDocument: any, options?: {
        keys: boolean;
    });
    setCollection: () => void;
    setDocument: () => void;
    setDocumentByCriteria: () => void;
    setDocumentByKey: () => void;
}
