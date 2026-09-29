import type { WebVitalMetric } from 'monitor-api';
import { describeAttribution, dominantPhase } from './vitalAttribution';

function metric(overrides: Partial<WebVitalMetric>): WebVitalMetric {
  return {
    name: 'LCP',
    value: 0,
    delta: 0,
    rating: 'good',
    id: 'm',
    navigationType: 'navigate',
    navigationId: 1,
    navigationURL: null,
    timestamp: 0,
    ...overrides,
  };
}

describe('describeAttribution', () => {
  it('is null without attribution', () => {
    expect(describeAttribution(metric({}))).toBeNull();
  });

  it('falls back to the LCP resource URL when there is no selector', () => {
    const lcp = metric({
      attribution: {
        target: null,
        url: '/hero.webp',
        timeToFirstByte: 1,
        resourceLoadDelay: 2,
        resourceLoadDuration: 3,
        elementRenderDelay: 4,
      },
    });

    expect(describeAttribution(lcp)?.target).toBe('/hero.webp');
  });

  it('names the INP target without a longest script', () => {
    const inp = metric({
      name: 'INP',
      attribution: {
        interactionTarget: null,
        interactionType: null,
        interactionTime: null,
        inputDelay: 1,
        processingDuration: 2,
        presentationDelay: 3,
        loadState: null,
        longestScript: null,
        totalScriptDuration: null,
        totalStyleAndLayoutDuration: null,
        totalPaintDuration: null,
        totalUnattributedDuration: null,
      },
    });

    expect(describeAttribution(inp)).toEqual({
      target: null,
      phases: [
        { label: 'Input delay', value: 1 },
        { label: 'Processing', value: 2 },
        { label: 'Presentation', value: 3 },
      ],
    });
  });

  it('reports the element that shifted most for CLS, without phases', () => {
    const cls = metric({
      name: 'CLS',
      attribution: {
        largestShiftTarget: '#banner',
        largestShiftTime: 10,
        largestShiftValue: 0.2,
        loadState: 'complete',
      },
    });

    expect(describeAttribution(cls)).toEqual({ target: '#banner', phases: [] });
  });

  it('splits FCP into server and client time', () => {
    const fcp = metric({
      name: 'FCP',
      attribution: { timeToFirstByte: 200, firstByteToFCP: 500, loadState: 'dom-interactive' },
    });

    expect(describeAttribution(fcp)?.phases.map((phase) => phase.value)).toEqual([200, 500]);
  });

  it('lists the TTFB phases in order', () => {
    const ttfb = metric({
      name: 'TTFB',
      attribution: {
        waitingDuration: 1,
        cacheDuration: 2,
        dnsDuration: 3,
        connectionDuration: 4,
        requestDuration: 5,
      },
    });

    expect(describeAttribution(ttfb)?.phases.map((phase) => phase.label)).toEqual([
      'Waiting',
      'Cache',
      'DNS',
      'Connection',
      'Request',
    ]);
  });
});

describe('dominantPhase', () => {
  it('picks the longest phase', () => {
    expect(
      dominantPhase([
        { label: 'a', value: 5 },
        { label: 'b', value: 9 },
        { label: 'c', value: 9 },
      ]),
    ).toEqual({ label: 'b', value: 9 });
  });

  it('is null when no phase took time', () => {
    expect(dominantPhase([])).toBeNull();
    expect(dominantPhase([{ label: 'a', value: 0 }])).toBeNull();
  });
});
