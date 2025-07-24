const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum_to_n');

export {};

// Test cases
const tests = [
    { n: 0, expected: 0 },
    { n: 1, expected: 1 },
    { n: 5, expected: 15 },  
    { n: 10, expected: 55 },
    { n: -3, expected: 0 }
];

// Run tests
console.log('Testing all three methods:\n');

tests.forEach(test => {
    const a = sum_to_n_a(test.n);
    const b = sum_to_n_b(test.n);
    const c = sum_to_n_c(test.n);

    console.log(`n = ${test.n}:`);
    console.log(`  Method A (formula):   ${a} ${a === test.expected ? '✓' : '✗'}`);
    console.log(`  Method B (loop):      ${b} ${b === test.expected ? '✓' : '✗'}`);
    console.log(`  Method C (recursive): ${c} ${c === test.expected ? '✓' : '✗'}`);
    console.log(`  Expected: ${test.expected}\n`);
});

