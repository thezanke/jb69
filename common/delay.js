/**
 * @param {number} duration
 * @returns {Promise<void>}
 */
export const delay = (duration) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
