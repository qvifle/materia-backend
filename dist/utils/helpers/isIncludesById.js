const isIncludesById = (array, id) => {
    const res = array.filter((el) => id == el.id);
    return !!res.length;
};
export default isIncludesById;
//# sourceMappingURL=isIncludesById.js.map