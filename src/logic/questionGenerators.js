function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Question shape:
// { level, slots: { a, op, b, result }, blankTarget: 'a'|'b'|'result', correctAnswer }
// null in slots = the □ the user fills in

export function genLevel1() {
  const useAdd = Math.random() < 0.5;

  if (useAdd) {
    const a = randInt(0, 10);
    const b = 10 - a;
    const blankTarget = pick(['a', 'b', 'result']);
    return {
      level: 1,
      slots: {
        a: blankTarget === 'a' ? null : a,
        op: '+',
        b: blankTarget === 'b' ? null : b,
        result: blankTarget === 'result' ? null : 10,
      },
      blankTarget,
      correctAnswer: blankTarget === 'a' ? a : blankTarget === 'b' ? b : 10,
    };
  } else {
    // 10 - b = result
    const b = randInt(0, 9);
    const result = 10 - b;
    const blankTarget = pick(['b', 'result']);
    return {
      level: 1,
      slots: {
        a: 10,
        op: '-',
        b: blankTarget === 'b' ? null : b,
        result: blankTarget === 'result' ? null : result,
      },
      blankTarget,
      correctAnswer: blankTarget === 'b' ? b : result,
    };
  }
}

export function genLevel2() {
  const useAdd = Math.random() < 0.5;

  if (useAdd) {
    let a, b;
    let attempts = 0;
    do {
      a = randInt(11, 89);
      b = randInt(11, 89);
      attempts++;
      if (attempts > 100) { a = 17; b = 15; break; }
    } while (
      (a % 10) + (b % 10) < 10 || // must carry
      a + b > 99                    // keep result 2-digit
    );
    return {
      level: 2,
      slots: { a, op: '+', b, result: null },
      blankTarget: 'result',
      correctAnswer: a + b,
    };
  } else {
    let a, b;
    let attempts = 0;
    do {
      a = randInt(21, 99);
      b = randInt(11, a - 1);
      attempts++;
      if (attempts > 100) { a = 53; b = 27; break; }
    } while (
      (a % 10) >= (b % 10) || // must borrow
      a - b < 10               // result must be 2-digit
    );
    return {
      level: 2,
      slots: { a, op: '-', b, result: null },
      blankTarget: 'result',
      correctAnswer: a - b,
    };
  }
}

// Tables 2-9, weighted: 6-9 appear 2x
const TABLE_POOL = [2, 3, 4, 5, 6, 6, 7, 7, 8, 8, 9, 9];

export function genLevel3() {
  const a = pick(TABLE_POOL);
  const b = randInt(2, 9);
  const result = a * b;
  const blankTarget = pick(['a', 'b', 'result']);
  return {
    level: 3,
    slots: {
      a: blankTarget === 'a' ? null : a,
      op: '×',
      b: blankTarget === 'b' ? null : b,
      result: blankTarget === 'result' ? null : result,
    },
    blankTarget,
    correctAnswer: blankTarget === 'a' ? a : blankTarget === 'b' ? b : result,
  };
}

export function genMixed() {
  const level = randInt(1, 3);
  if (level === 1) return genLevel1();
  if (level === 2) return genLevel2();
  return genLevel3();
}

export function genByMode(courseMode) {
  switch (courseMode) {
    case 'level1': return genLevel1();
    case 'level2': return genLevel2();
    case 'level3': return genLevel3();
    case 'mixed':  return genMixed();
    default:       return genLevel1();
  }
}

export function questionKey(q) {
  const { a, op, b, result } = q.slots;
  return `${a ?? '□'}${op}${b ?? '□'}=${result ?? '□'}`;
}
