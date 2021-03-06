/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IfElement } from './if_element';

describe('IfElement', () => {
  let statement;
  let depth;
  let parentId;

  beforeEach(() => {
    statement = {
      id: 'statement_id',
    };

    depth = 1;
    parentId = 'parent_id';
  });

  it('has expected props', () => {
    const element = new IfElement(statement, depth, parentId);

    expect(element.id).toBe('statement_id');
    expect(element.statement).toBe(statement);
    expect(element.depth).toBe(1);
    expect(element.parentId).toBe('parent_id');
  });
});
