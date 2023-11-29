export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const removeWhitespace = text => {
  return text.replace(/\s/g, '');
};
