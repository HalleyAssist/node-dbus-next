// parse signature from string to tree

const match = {
  '{': '}',
  '(': ')'
};

const knownTypes = {};
'(){}ybnqiuxtdsogarvehm*?@&^'.split('').forEach(function (c) {
  knownTypes[c] = true;
});


function checkNotEnd (c) {
  if (!c) {
    throw new Error('Bad signature: unexpected end');
  }
  return c;
}

function parseSignature (signature) {
  let index = 0;
  function next () {
    if (index < signature.length) {
      const c = signature[index];
      ++index;
      return c;
    }
    return null;
  }

  function parseOne (c) {

    if (!knownTypes[c]) { throw new Error(`Unknown type: "${c}" in signature "${signature}"`); }

    let ele;
    const res = { type: c };
    switch (c) {
      case 'a': // array
        ele = next();
        checkNotEnd(ele);
        res.child = [parseOne(ele)]
        break
      case '{': // dict entry
      case '(': // struct
        res.child = []
        while ((ele = next()) !== null && ele !== match[c]) { res.child.push(parseOne(ele)); }
        checkNotEnd(ele);
        break
    }
    return res;
  }

  const ret = [];
  let c;
  while ((c = next()) !== null) {
    ret.push(parseOne(c));
  }
  return ret;
}

function collapseSignature (value) {
  if (!value.child?.length) {
    return value.type;
  }

  let type = value.type;
  for (let i = 0; i < value.child.length; ++i) {
    type += collapseSignature(value.child[i]);
  }
  if (type[0] === '{') {
    type += '}';
  } else if (type[0] === '(') {
    type += ')';
  }
  return type;
}

module.exports = {
  parseSignature: parseSignature,
  collapseSignature: collapseSignature
};
