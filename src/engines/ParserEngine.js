const GROUND_TRUTH_TEMPLATES = {
  average: {
    title: "Calculate Average",
    python: {
      easy: `def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count`,
      medium: `def calculate_average(numbers):
    if not numbers:
        return 0
    total = sum(numbers)
    return total / len(numbers)`,
      hard: `def calculate_average(numbers):
    if not isinstance(numbers, list) or len(numbers) == 0:
        raise ValueError("Input must be a non-empty list")
    return sum(numbers) / len(numbers)`
    },
    javascript: {
      easy: `function calculateAverage(numbers) {
    const total = numbers.reduce((a, b) => a + b, 0);
    return total / numbers.length;
}`,
      medium: `function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const total = numbers.reduce((a, b) => a + b, 0);
    return total / numbers.length;
}`,
      hard: `function calculateAverage(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error("Input must be a non-empty array");
    }
    const total = numbers.reduce((a, b) => a + b, 0);
    return total / numbers.length;
}`
    }
  },
  largest: {
    title: "Find Largest Number",
    python: {
      easy: `def find_largest(numbers):
    largest = numbers[0]
    for num in numbers:
        if num > largest:
            largest = num
    return largest`,
      medium: `def find_largest(numbers):
    if not numbers:
        return None
    return max(numbers)`,
      hard: `def find_largest(numbers):
    if not isinstance(numbers, list) or len(numbers) == 0:
        raise ValueError("Invalid input")
    largest = numbers[0]
    for i in range(1, len(numbers)):
        if numbers[i] > largest:
            largest = numbers[i]
    return largest`
    }
  }
};

export const parseRequirement = (input) => {
  const text = input.toLowerCase();
  
  if (text.includes("average") || text.includes("mean")) {
    return GROUND_TRUTH_TEMPLATES.average;
  }
  if (text.includes("largest") || text.includes("maximum") || text.includes("max")) {
    return GROUND_TRUTH_TEMPLATES.largest;
  }
  
  return null;
};

export const getPushStart = (template, language = 'python') => {
  if (!template) return "";
  
  if (language === 'python') {
    return `def solve(input_data):\n    # Your code here\n    pass`;
  }
  if (language === 'javascript') {
    return `function solve(inputData) {\n    // Your code here\n}`;
  }
  
  return "";
};
