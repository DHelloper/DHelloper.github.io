---
layout: ../../layouts/Layout.astro
title: PostgreSQL Index를 적용하면 정말 빨라질까?
description: 100만 건 데이터를 기준으로 PostgreSQL Index 성능을 비교한 실험
---
# PostgreSQL Index를 적용하면 정말 빨라질까?

## 1. 문제
데이터가 많아졌을 때 단순 조회 쿼리가 얼마나 느려지는지 확인하고 Index 적용 전후를 검증한다.

## 2. 실험 환경
- PostgreSQL:
- 데이터: 1,000,000 rows
- CPU:
- Memory:

## 3. Before
```sql
SELECT * FROM contents WHERE user_id = 100;
```

## 4. EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE SELECT * FROM contents WHERE user_id = 100;
```

## 5. Index 적용
```sql
CREATE INDEX idx_contents_user_id ON contents(user_id);
```

## 6. 결과
| 지표 | Before | After |
|---|---:|---:|
| Average | - | - |
| P95 | - | - |
| P99 | - | - |
| Execution Time | - | - |

## 7. 분석
실제 실행 계획과 측정 결과를 작성한다.

## 8. Trade-off
Index는 조회 성능을 높이지만 INSERT/UPDATE 비용과 저장 공간을 증가시킨다.

## 9. 면접 질문
- Index는 왜 빠른가?
- Index를 많이 만들면 좋은가?
