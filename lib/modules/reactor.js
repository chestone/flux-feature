import {Reactor} from 'nuclear-js';

const reactor = new Reactor({
  debug: process.env.NODE_ENV === 'development'
});

export default reactor;

