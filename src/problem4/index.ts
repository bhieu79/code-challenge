const readline = require('readline');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum_to_n');

// This export statement prevents TypeScript from treating this as a global script
export {};


// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask for input and run all three solutions
rl.question('Enter a number: ', (input: string) => {
    const n = parseInt(input);
    
    if (isNaN(n)) {
        console.log('Please enter a valid number');
        rl.close();
        return;
    }
    
    console.log(`\nSum from 1 to ${n}:`);
    console.log(`Method A (formula): ${sum_to_n_a(n)}`);
    console.log(`Method B (loop): ${sum_to_n_b(n)}`);
    console.log(`Method C (recursion): ${sum_to_n_c(n)}`);
    
    rl.close();
});
