export default class Localbase {
    constructor(dbName: any);
    dbName: any;
    lf: {};
    collectionName: any;
    orderByProperty: any;
    orderByDirection: any;
    limitBy: any;
    docSelectionCriteria: any;
    deleteCollectionQueue: {
        queue: never[];
        running: boolean;
    };
    config: {
        debug: boolean;
    };
    userErrors: any[];
    collection: typeof collection;
    doc: typeof doc;
    orderBy: typeof orderBy;
    limit: typeof limit;
    offset: (skipCount: number) => this;
    skip: (skipCount: number) => this;
    where: typeof where;
    get: typeof get;
    add: typeof add;
    update: typeof update;
    set: typeof set;
    delete: typeof deleteIt;
    count: () => Promise<number>;
    paginate: (options?: { page?: number; limit?: number; pageSize?: number }) => Promise<{
        total_rows: number;
        row_limit: number;
        total_page: number;
        current_page: number;
        rows: any[];
    }>;
    exists: () => Promise<boolean>;
    upsert: (data: any) => Promise<any>;
    onSnapshot: (callback: (snapshot: any, change?: any) => void) => () => void;
    export: (options?: { format?: 'json' | 'csv'; download?: boolean; filename?: string; pretty?: boolean; keys?: boolean; raw?: boolean }) => Promise<any>;
    import: (payload: any, options?: { overwrite?: boolean }) => Promise<any>;
    version: (targetVersion: number, migrationFn?: (db: this) => Promise<void> | void) => Promise<number>;
    getVersion: () => Promise<number>;
}
import collection from "./api/selectors/collection";
import doc from "./api/selectors/doc";
import orderBy from "./api/filters/orderBy";
import limit from "./api/filters/limit";
import where from "./api/filters/where";
import get from "./api/actions/get";
import add from "./api/actions/add";
import update from "./api/actions/update";
import set from "./api/actions/set";
import deleteIt from "./api/actions/delete";
