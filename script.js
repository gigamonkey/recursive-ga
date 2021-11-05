const ALPHABET = "abcdefghijklmnopqrstuvwxyz ,.?!;:";
const MAX_GENERATIONS = 1000;

function solve(phrase, populationSize = 1000, mutationRate = 0.0001, alphabet = ALPHABET) {
  let generator = makeRandomPhraseGenerator(phrase.length, alphabet);
  let fitness = makeFitnessFunction(phrase);
  let crosser = cross;
  let mutator = makeMutator(alphabet, mutationRate);
  let done = makeStopTest(phrase);

  let population = newPopulation(populationSize, generator);
  return genetic_search(population, fitness, crosser, mutator, done, 0);
}

function genetic_search(population, fitness, crosser, mutator, done, generation) {
  if (generation == MAX_GENERATIONS || done(population)) {
    return { best: best(population, fitness), generation: generation }
  } else {
    let parents = getParents(population, fitness);
    let next = nextGeneration(population.length, parents, crosser, mutator);
    return genetic_search(next, fitness, crosser, mutator, done, generation + 1);
  }
}

function makeRandomPhraseGenerator(length, alphabet) {
  return () => {
    let phrase = "";
    for (let i = 0; i < length; i++) {
      phrase += random(alphabet);
    }
    return phrase;
  };
}

function newPopulation(size, generator) {
  let population = [];
  for (let i = 0; i < size; i++) {
    population.push(generator());
  }
  return population;
}

function makeFitnessFunction(phrase) {
  return (element) => {
    let f = 0;
    for (let i = 0; i < element.length; i++) {
      if (element[i] === phrase[i]) {
        f++;
      }
    }
    return f;
  };
}

function makeMutator(alphabet, mutationRate) {
  return (phrase) => {
    let mutated = "";
    for (let i = 0; i < phrase.length; i++) {
      mutated += Math.random() < mutationRate ? random(alphabet) : phrase[i];
    }
    return mutated;
  };
}

function makeStopTest(phrase) {
  return (population) => population.indexOf(phrase) != -1;
}

function cross(p1, p2) {
  let i = Math.floor(Math.random() * p1.length);
  return p1.substring(0, i) + p2.substring(i);
}

function best(population, fitness) {
  let maxFitness = -1;
  let best = null;
  for (let i = 0; i < population.length; i++) {
    let f = fitness(population[i]);
    if (f > maxFitness) {
      maxFitness = f;
      best = population[i];
    }
  }
  return best;
}

function getParents(population, fitness) {
  let parents = [];
  for (var i = 0; i < population.length; i++) {
    for (let j = 0; j < fitness(population[i]); j++) {
      parents.push(population[i]);
    }
  }
  // It's possible, though unlikely, that every member of the population
  // has fitness zero and thus there are no parents. Gotta hope for some
  // benefitial mutations in that case.
  return parents.length > 0 ? parents : population;
}

function nextGeneration(size, parents, crosser, mutator) {
  let gen = [];
  for (var i = 0; i < size; i++) {
    gen.push(mutator(crosser(random(parents), random(parents))));
  }
  return gen;
}

function random(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}
