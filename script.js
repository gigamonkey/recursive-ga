const ALPHABET = "abcdefghijklmnopqrstuvwxyz ";
const MUTATION_RATE = 0.0001;
const MAX_GENERATIONS = 1000;

function solve(phrase, populationSize=1000, alphabet=ALPHABET) {
  let initialPopulation = newPopulation(populationSize, phrase.length, alphabet);
  return genetic_search(initialPopulation, phrase, alphabet, 0)
}

function genetic_search(population, phrase, alphabet, generation) {
  if (generation == MAX_GENERATIONS || done(population, phrase)) {
    return { best: best(population, phrase), generation: generation }
  } else {
    let next = nextGeneration(population, phrase, alphabet);
    return genetic_search(next, phrase, alphabet, generation + 1);
  }
}

function newPopulation(size, phraseLength, alphabet) {
  let population = [];
  for (let i = 0; i < size; i++) {
    population.push(randomPhrase(phraseLength, alphabet));
  }
  return population;
}

function randomPhrase(length, alphabet) {
  let phrase = "";
  for (let i = 0; i < length; i++) {
    phrase += random(alphabet);
  }
  return phrase;
}

function done(population, phrase) {
  return population.indexOf(phrase) != -1;
}

function best(population, phrase) {
  let maxFitness = -1;
  let best = null;
  for (let i = 0; i < population.length; i++) {
    let f = fitness(population[i], phrase);
    if (f > maxFitness) {
      maxFitness = f;
      best = population[i];
    }
  }
  return best;
}

function fitness(element, phrase) {
  let f = 0;
  for (let i = 0; i < element.length; i++) {
    if (element[i] === phrase[i]) {
      f++;
    }
  }
  return f;
}

function nextGeneration(population, phrase, alphabet) {
  let parents = getParents(population, phrase);
  let gen = [];
  for (var i = 0; i < population.length; i++) {
    gen.push(mutate(cross(random(parents), random(parents)), alphabet));
  }
  return gen;
}

function getParents(population, phrase) {
  let parents = [];
  for (var i = 0; i < population.length; i++) {
    for (let j = 0; j < fitness(population[i], phrase); j++) {
      parents.push(population[i]);
    }
  }
  // It's possible, though unlikely, that every member of the population
  // has fitness zero and thus there are no parents. Gotta hope for some
  // benefitial mutations in that case.
  return parents.length > 0 ? parents : population;
}

function fitness(str, phrase) {
  var f = 0
  for (var i = 0; i < phrase.length; i++) {
    if (str[i] == phrase[i]) {
      f++;
    }
  }
  return f;
}

function cross(p1, p2) {
  let i = Math.floor(Math.random() * p1.length);
  return p1.substring(0, i) + p2.substring(i);
}

function mutate(str, alphabet) {
  let mutated = "";
  for (let i = 0; i < str.length; i++) {
    mutated += Math.random() < MUTATION_RATE ? random(alphabet) : str[i];
  }
  return mutated;
}

function random(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}
