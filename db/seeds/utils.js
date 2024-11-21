exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createProductRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatReviewData = (reviews, productRef) => {
  return reviews.map(({ product_name, ...restOfReview }) => {
    const product_id = productRef[product_name];
    if (!product_id) {
      throw new Error(
        `Product name "${product_name}" not found in reference object`
      );
    }
    return {
      product_id,
      ...exports.convertTimestampToDate(restOfReview),
    };
  });
};
