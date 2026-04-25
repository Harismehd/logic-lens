export const PATTERNS = [
    {
        id: "find_largest",
        keywords: ["largest", "maximum", "biggest", "max", "find max"],
        title: "Find Largest Number",
        ground_truth: "def find_largest(arr):\n    if not arr:\n        return None\n    max_val = arr[0]\n    for num in arr:\n        if num > max_val:\n            max_val = num\n    return max_val",
        sample_input: "[10, 5, 24, 8, 15]",
        sample_output: "24",
        push_start: "def find_largest(arr):\n    # Your code here\n    pass",
        difficulty: "easy"
    },
    {
        id: "calculate_average",
        keywords: ["average", "mean", "calculate average"],
        title: "Calculate Average",
        ground_truth: "def calculate_average(numbers):\n    if not numbers:\n        return 0\n    total = sum(numbers)\n    return total / len(numbers)",
        sample_input: "[1, 2, 3, 4, 5]",
        sample_output: "3.0",
        push_start: "def calculate_average(numbers):\n    # Your code here\n    pass",
        difficulty: "easy"
    },
    {
        id: "reverse_string",
        keywords: ["reverse", "backward", "string"],
        title: "Reverse a String",
        ground_truth: "def reverse_string(s):\n    return s[::-1]",
        sample_input: "'hello'",
        sample_output: "'olleh'",
        push_start: "def reverse_string(s):\n    # Your code here\n    pass",
        difficulty: "easy"
    },
    {
        id: "fizz_buzz",
        keywords: ["fizz", "buzz", "fizzbuzz"],
        title: "FizzBuzz",
        ground_truth: "def fizz_buzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append('FizzBuzz')\n        elif i % 3 == 0:\n            result.append('Fizz')\n        elif i % 5 == 0:\n            result.append('Buzz')\n        else:\n            result.append(str(i))\n    return result",
        sample_input: "15",
        sample_output: "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']",
        push_start: "def fizz_buzz(n):\n    # Your code here\n    pass",
        difficulty: "medium"
    }
];
