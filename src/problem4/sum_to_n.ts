// Problem 4: Three Ways to Sum to n
// Calculate sum of integers from 1 to n

// Method 1: Math formula - FASTEST O(1) time - O(1) space
function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

// Method 2: Loop - MEDIUM O(n) time - O(1) space
function sum_to_n_b(n: number): number {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Method 3: Recursion - SLOWEST O(n) time - O(n) space (call stack n times)
function sum_to_n_c(n: number): number {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

export {};
