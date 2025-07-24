# Problem 4: Sum to N Calculator

A TypeScript implementation demonstrating three different approaches to calculate the sum of integers from 1 to n.

**Example:** `sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15`

## Quick Start

```bash
# Install dependencies
npm ci

# Run the calculator
npm start
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run the interactive calculator |
| `npm test` | Execute test suite |
| `npm ci` | Install project dependencies |

## Project Structure

```
problem4/
├── index.ts           # Main interactive program
├── sum_to_n.ts        # Three sum implementations
├── test_sum_to_n.ts   # Test suite
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── .gitignore         # Git ignore rules
```

## 🧪 Testing

The test suite validates all three methods with various inputs:

```bash
npm test
```

Test cases include:
- Edge cases (0, negative numbers)
- Small values (1, 5)
- Larger values (10)

## Performance Comparison

| Method    | Time Complexity | Space Complexity | Performance |
|-----------|-----------------|------------------|-------------|
| Formula   |      O(1)       |       O(1)       |   Fastest   |
| Loop      |      O(n)       |       O(1)       |   Medium    |
| Recursion |      O(n)       |       O(n)       |   Slowest   |

## Usage Example

```bash
$ npm start
Enter a number: 10

Sum from 1 to 10:
Method A (formula): 55
Method B (loop): 55
Method C (recursion): 55
```

## Requirements

- Node.js (v14 or higher)
- TypeScript
- ts-node
