export type WhereOperator =
  | '=='
  | '==='
  | '!='
  | '<>'
  | '>'
  | '>='
  | '<'
  | '<='
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any'
  | 'between';

export default function where(field: string, operator: WhereOperator | any, value?: any): any;
