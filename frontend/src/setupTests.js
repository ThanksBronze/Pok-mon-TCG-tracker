// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import axios from 'axios';        // just to get the Jest mock registered
import mockAxios from 'axios';    // TS: same thing, bring in the mock
import * as seriesAPI from './api/series';
import * as setsAPI   from './api/sets';
import * as typesAPI  from './api/cardTypes';

jest.spyOn(seriesAPI, 'fetchSeries')
    .mockResolvedValue({ data: [] });
jest.spyOn(setsAPI, 'fetchSets')
    .mockResolvedValue({ data: [] });
jest.spyOn(typesAPI, 'fetchCardTypes')
    .mockResolvedValue({ data: [] });

// stub out the module as a factory:
jest.mock('axios', () => {
  // create a “self‑referencing” stub so axios.create() returns the same mock
  const m = {
    create: jest.fn(() => m),
    get:    jest.fn(() => Promise.resolve({ data: [] })),
    post:   jest.fn(() => Promise.resolve({ data: {} })),
    // add any other methods you use, e.g. put, delete, interceptors…
    interceptors: {
      request:  { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return m;
});
