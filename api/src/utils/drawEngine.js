// Draw Engine - Calculates winners and prize distribution

export function generateRandomDraw(numberOfNumbers = 5) {
  const numbers = [];
  while (numbers.length < numberOfNumbers) {
    const num = Math.floor(Math.random() * 45) + 1; // 1-45 Stableford range
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

export function generateAlgorithmicDraw(scores) {
  // Weighted draw based on frequency of user scores
  const frequency = {};
  scores.forEach(score => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  const weighted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([score]) => parseInt(score))
    .sort((a, b) => a - b);

  // Fill remaining slots randomly if needed
  while (weighted.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!weighted.includes(num)) {
      weighted.push(num);
    }
  }

  return weighted.sort((a, b) => a - b);
}

export function findMatches(userScores, drawNumbers) {
  const userScoresArray = Array.isArray(userScores) ? userScores : userScores.split(',').map(Number);
  const drawArray = Array.isArray(drawNumbers) ? drawNumbers : drawNumbers.split(',').map(Number);
  
  const matches = userScoresArray.filter(score => drawArray.includes(score));
  return matches;
}

export function calculatePrizeDistribution(totalSubscribers, monthlyAmount) {
  const totalPool = totalSubscribers * monthlyAmount;

  return {
    five_match: Math.floor(totalPool * 0.40),
    four_match: Math.floor(totalPool * 0.35),
    three_match: Math.floor(totalPool * 0.25)
  };
}

export function splitPrizeAmongWinners(prizeAmount, winnerCount) {
  return Math.floor(prizeAmount / winnerCount);
}
