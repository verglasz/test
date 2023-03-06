data {
  int<lower=0> N;
  array[N] int flips;
}

parameters {
  real <lower=0, upper=1> p;
}

model {
  for(i in 1:N) {
    flips[i] ~ bernoulli(p);
  }
  

  p ~ beta(2.0,2.0);
}
