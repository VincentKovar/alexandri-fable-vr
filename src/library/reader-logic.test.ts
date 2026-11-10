/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GUTENBERG_LIBRARY_DATA,
  getBookById,
  getBooksByTier,
  getNextPageIndex,
  getPrevPageIndex,
  computeShelfCoordinates,
  ENVIRONMENT_PRESETS,
} from './reader-logic';

test('Gutenberg dataset contains exactly 12 required classic books with valid data', () => {
  assert.equal(GUTENBERG_LIBRARY_DATA.length, 12);

  const expectedTitles = [
    'Frankenstein; or, The Modern Prometheus',
    'Pride and Prejudice',
    'The Great Gatsby',
    "Alice's Adventures in Wonderland",
    'Moby Dick; or, The Whale',
    'The Time Machine',
    'Dracula',
    'The Adventures of Sherlock Holmes',
    'War and Peace',
    'A Tale of Two Cities',
    'The Picture of Dorian Gray',
    'The Metamorphosis',
  ];

  for (const book of GUTENBERG_LIBRARY_DATA) {
    assert.ok(book.id, 'Book must have an id');
    assert.ok(book.title, 'Book must have a title');
    assert.ok(book.author, 'Book must have an author');
    assert.ok(book.gutenbergId > 0, 'Book must have a positive gutenbergId');
    assert.ok(book.pages.length >= 4, `${book.title} must have at least 4 pages`);
  }

  const titles = GUTENBERG_LIBRARY_DATA.map((b) => b.title);
  assert.deepEqual(titles, expectedTitles);
});

test('Shelf tiers are evenly divided into 4 books per tier across 3 tiers', () => {
  for (let tier = 0; tier < 3; tier++) {
    const books = getBooksByTier(tier);
    assert.equal(books.length, 4, `Tier ${tier} should have 4 books`);
    const positions = books.map((b) => b.shelfPosition).sort();
    assert.deepEqual(positions, [0, 1, 2, 3]);
  }
});

test('getBookById returns correct book or undefined', () => {
  const frankenstein = getBookById('frankenstein');
  assert.ok(frankenstein);
  assert.equal(frankenstein?.gutenbergId, 84);

  const missing = getBookById('non-existent-book');
  assert.equal(missing, undefined);
});

test('Pagination transitions advance and clamp within bounds', () => {
  const totalPages = 5;
  assert.equal(getNextPageIndex(0, totalPages), 1);
  assert.equal(getNextPageIndex(3, totalPages), 4);
  assert.equal(getNextPageIndex(4, totalPages), 4); // Clamped at end

  assert.equal(getPrevPageIndex(4), 3);
  assert.equal(getPrevPageIndex(1), 0);
  assert.equal(getPrevPageIndex(0), 0); // Clamped at start
});

test('Shelf coordinates compute valid geometric positions', () => {
  const coords00 = computeShelfCoordinates(0, 0);
  assert.equal(coords00.y, 2.2);
  assert.equal(coords00.x, -0.75);

  const coords23 = computeShelfCoordinates(2, 3);
  assert.equal(coords23.y, 0.6);
  assert.equal(coords23.x, -0.75 + 3 * 0.5);
});

test('Environment presets contain valid lighting configs', () => {
  const presets = Object.keys(ENVIRONMENT_PRESETS);
  assert.ok(presets.includes('victorian_grand'));
  assert.ok(presets.includes('cozy_oxford'));
  assert.ok(presets.includes('cyberpunk_archive'));
  assert.ok(presets.includes('ancient_monastery'));

  for (const key of presets) {
    const p = ENVIRONMENT_PRESETS[key as keyof typeof ENVIRONMENT_PRESETS];
    assert.ok(p.ambientIntensity > 0);
    assert.ok(p.spotlightIntensity > 0);
  }
});
