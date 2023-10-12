export default function where(whereSelectionCriteria) {
  if (!whereSelectionCriteria) {
    this.userErrors.push('No where criteria specified in where() method. object (with criteria) e.g. { id_eq: 1 }, { id_lt: 5 }, { id_gt: 5 }, { id_lte: 5 }, { id_gte: 5 }, { id_contains: "foo" }, { id_startsWith: "foo" }, { id_endsWith: "foo" }, { id_in: [1, 2, 3] }, { id_nin: [1, 2, 3] }, { id_neq: 1 }, { id_null: true }, { id_notNull: true }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_like: "foo" }, { id_notLike: "foo" }, { id_iLike: "foo" }, { id_notILike: "foo" }, { id_regexp: "foo" }, { id_notRegexp: "foo" }, { id_iRegexp: "foo" }, { id_notIRegexp: "foo" }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }, { id_between: [1, 10] }, { id_notBetween: [1, 10] }')
  }
  else if (typeof whereSelectionCriteria !== 'object') {
    this.userErrors.push('Where criteria specified in where() method must not be a number, boolean or string. Use object (with criteria) e.g. { id: 1 }')
  }
  else if (Array.isArray(whereSelectionCriteria)) {
    this.userErrors.push('Where criteria specified in where() method must not be an array. Use object (with criteria) e.g. { id: 1 }')
  }else {
    this.whereArguments.push(whereSelectionCriteria);
  }
  return this
}