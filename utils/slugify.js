exports.slugify = function (name) {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')       // spaces → -
    .replace(/[^a-z0-9\-]/g, '') // keep a-z, 0-9, dash only
    .replace(/\-+/g, '-')       // multiple - → single -
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};