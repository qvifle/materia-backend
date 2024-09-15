const isIncludesById = (array: any, id: string) => {
  const res = array.filter((el: { id: string }) => id == el.id);
  return !!res.length;
};

export default isIncludesById;
