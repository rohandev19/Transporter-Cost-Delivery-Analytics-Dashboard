import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { downloadCsv } from './exportCsv';

describe('exportCsv', () => {
  let createObjectURLMock: any;
  let revokeObjectURLMock: any;
  let clickMock: any;

  beforeAll(() => {
    createObjectURLMock = vi.fn(() => 'blob:mock-url');
    revokeObjectURLMock = vi.fn();
    clickMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should generate and download a CSV file', () => {
    const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: clickMock,
        } as any;
      }
      return document.createElement(tagName);
    });

    downloadCsv('id,name\n1,Alice', 'test-export.csv');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});
