const getClasses = (element) => {
  return element.className
    .split(' ')
    .filter((s) => (s !== ''));
};

const hasClass = (element, className) => {
  return getClasses(element).indexOf(className) !== -1;
};

const addClass = (element, className) => {
  if (!hasClass(element, className)) {
    element.className = getClasses(element)
      .concat([className])
      .join(' ');
  }
};

const removeClass = (element, className) => {
  element.className = getClasses(element)
    .filter((currentClassName) => (currentClassName !== className))
    .join(' ');
};

const toggleClass = (element, className) => {
  let classes = getClasses(element);
  let index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
  } else {
    classes.push(className);
  }

  element.className = classes.join(' ');
};

const getPrefixedProperty = (element, propertyName) => {
  let capitalizedPropertyName = propertyName[0].toUpperCase() + propertyName.slice(1);

  return element[propertyName] ||
    element['moz' + capitalizedPropertyName] ||
    element['webkit' + capitalizedPropertyName];
};

export {getClasses, addClass, removeClass, toggleClass, hasClass, getPrefixedProperty};