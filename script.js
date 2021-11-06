/*
 * Top-level solver. This just sets up the various functions we need to pass
 * into genetic_search and then calls it to do all the real work. In theory
 * the basic structure of genetic_search should work for any problem as long
 * as we can define the six functions newCritter, fitness, parentSelector, 
 * crosser, mutator, and done in some appropriate way.
 */
function solve(
  phrase,
  populationSize = 1000,
  mutationRate = 0.0001,
  maxGenerations = 1000,
  alphabet = "abcdefghijklmnopqrstuvwxyz ,.?!;:"
) {
  let newCritter = randomPhraseGenerator(phrase.length, alphabet);
  let fitness = phraseSimilarity(phrase);
  let parentSelector = weightByFitness(fitness);
  let crosser = randomCrossover;
  let mutator = pointMutator(alphabet, mutationRate);
  let done = fitnessThreshold(fitness, phrase.length);

  let population = newPopulation(populationSize, newCritter);
  return genetic_search(population, fitness, parentSelector, crosser, mutator, done, maxGenerations, 0);
}

/*
 * Recursive search. Most of the arguments to this function are other functions
 * that provide the specific implementations of things like measuring fitness,
 * crossing two parents, mutating the result, and testing the population to see
 * if we are done. We also limit the number of generations so we don't recurse forever.
 * 
 * Because Javascript doesn't do tail-call optimimization, this implementation could
 * eventually run into limits on recursion depth but modern browsers have pretty high
 * limits (over 9,000 at least if Stack Overflow is to be trusted.)
 */
function genetic_search(population, fitness, parentSelector, crosser, mutator, done, maxGenerations, generation) {
  if (generation == maxGenerations || done(population)) {
    return { best: best(population, fitness), generation: generation }
  } else {
    let parents = parentSelector(population);
    let next = nextGeneration(population.length, parents, crosser, mutator);
    return genetic_search(next, fitness, parentSelector, crosser, mutator, done, maxGenerations, generation + 1);
  }
}

function randomPhraseGenerator(length, alphabet) {
  return () => Array(length).fill().map(() => random(alphabet)).join("");
}

function newPopulation(size, newCritter) {
  return Array(size).fill().map(newCritter);
}

function phraseSimilarity(phrase) {
  return (p) => Array.from(p).reduce((acc, c, i) => acc + (c == phrase[i] ? 1 : 0), 0);
}

function pointMutator(alphabet, mutationRate) {
  let maybeMutate = (c) => Math.random() < mutationRate ? random(alphabet) : c;
  return (p) => Array.from(p).map(maybeMutate).join("");
}

function fitnessThreshold(fitness, threshold) {
  return (population) => population.some((p) => fitness(p) >= threshold);
}

function randomCrossover(p1, p2) {
  let i = Math.floor(Math.random() * p1.length);
  return p1.substring(0, i) + p2.substring(i);
}

function best(population, fitness) {
  let wrap = (p) => ({ p: p, fitness: fitness(p) });
  return population.map(wrap).reduce((best, p) => (p.fitness > best.fitness ? p : best)).p;
}

function weightByFitness(fitness, scale = 1) {
  return (population) => {
    let parents = population.flatMap((p) => Array(fitness(p) * scale).fill(p));
    // It's possible, though unlikely, that every member of the population
    // has fitness zero and thus there are no parents. Everybody in the current
    // generation gets a chance to procreate in that case and we have to hope
    // for some benefitial mutations.
    return parents.length > 0 ? parents : population;
  };
}

function nextGeneration(size, parents, crosser, mutator) {
  let makeBaby = () => mutator(crosser(random(parents), random(parents)));
  return Array(size).fill().map(makeBaby);
}

function random(xs) {
  return xs[Math.floor(Math.random() * xs.length)];
}
