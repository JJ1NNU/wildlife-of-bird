import versionFile from '../../../version.json';
import { fileCount, loaded } from './data.ts';

/**
 * M0 배포 경로 확인용 화면 하나(#17). 실제 게임 화면은 M1(#24)에 만든다.
 * 잠정(#17): 엔진 API(#3)가 main에 들어오면 newRun → getView 결과를 그린다.
 * 개발 확인용 화면이라 문구를 data/text/로 옮기지 않았다 — M1 화면부터 옮긴다.
 */
export function App() {
  const { data, issues } = loaded;
  return (
    <main data-testid="dev-check">
      <h1>야생조류 키우기</h1>
      <p className="muted">개발 빌드 v{versionFile.gameVersion}</p>

      <section>
        <h2>데이터</h2>
        <p data-testid="data-status">
          파일 {fileCount}개 · {data ? '검증 통과' : `검증 문제 ${issues.length}건`}
        </p>
        {data && (
          <ul>
            {[...data.ecology.values()].map((s) => (
              <li key={s.id}>
                {s.nameKo} <i>{s.scientificName}</i>
              </li>
            ))}
          </ul>
        )}
        {issues.length > 0 && (
          <ul className="issues">
            {issues.map((i) => (
              <li key={`${i.file}:${i.at}:${i.reason}`}>
                <code>{i.file}</code> {i.at} — {i.reason}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
