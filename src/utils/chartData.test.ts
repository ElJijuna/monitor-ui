import { toChartData } from './chartData'

describe('toChartData', () => {
  it('returns history when it has more than 1 point', () => {
    expect(toChartData([60, 58, 62], 60)).toEqual([60, 58, 62])
  })

  it('returns [fallback, fallback] when history is empty', () => {
    expect(toChartData([], 60)).toEqual([60, 60])
  })

  it('returns [fallback, fallback] when history has exactly 1 point', () => {
    expect(toChartData([45], 45)).toEqual([45, 45])
  })
})
