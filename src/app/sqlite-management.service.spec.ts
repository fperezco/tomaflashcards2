import { TestBed } from '@angular/core/testing';

import { SqliteManagementService } from './sqlite-management.service';

describe('SqliteManagementService', () => {
  let service: SqliteManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
