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
    get: typeof get;
    add: typeof add;
    update: typeof update;
    set: typeof set;
    delete: typeof deleteIt;
}
import collection from "./api/selectors/collection";
import doc from "./api/selectors/doc";
import orderBy from "./api/filters/orderBy";
import limit from "./api/filters/limit";
import get from "./api/actions/get";
import add from "./api/actions/add";
import update from "./api/actions/update";
import set from "./api/actions/set";
import deleteIt from "./api/actions/delete";
