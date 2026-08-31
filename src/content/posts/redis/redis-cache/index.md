---
title: Redis Cache 적용 전후 성능 비교
description: Cache Aside 패턴을 적용하고 성능을 비교한 실험
category: Redis
pubDate: 2026-08-31
---

# Redis Cache 적용 전후 성능 비교

## 1. 문제
조회 요청이 많아질 때 DB에 모든 요청이 집중되는 문제를 재현하고 Redis Cache 적용 효과를 측정한다.

## 2. Before
```text
Client → Application → PostgreSQL
```

## 3. After
```text
Client → Application → Redis
                         ↓ Cache Miss
                      PostgreSQL
```

## 4. 결과
| 지표 | DB Only | Redis Cache |
|---|---:|---:|
| Average | - | - |
| P95 | - | - |
| P99 | - | - |
| RPS | - | - |
| DB CPU | - | - |

## 5. 분석
실제 부하 테스트 결과를 바탕으로 병목이 어떻게 이동했는지 기록한다.

## 6. Trade-off
Cache는 조회 성능을 높이지만 정합성, 만료, Cache Stampede 등을 고려해야 한다.

## 7. 면접 질문
- 왜 Redis를 사용했는가?
- Cache Aside란 무엇인가?
- Redis 장애가 발생하면 어떻게 할 것인가?
