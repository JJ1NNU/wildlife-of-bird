import { getView, newRun } from '@wb/engine';
import versionFile from '../../../version.json';
import { fileCount, loaded } from './data.ts';

/**
 * M0 배포 경로 확인용 화면 하나(#17). 실제 게임 화면은 M1(#24)에 만든다.
 * 데이터 묶음이 만들어지면 엔진 newRun → getView 결과를 그린다.
 * 효과 등급표·공식 계수(data/balance/effects.json · formulas.json)가 없으면 묶음이 없어 안내만 한다.
 * 개발 확인용 화면이라 문구를 data/text/로 옮기지 않았다 — M1 화면부터 옮긴다.
 */
export function App() {
  const { data, issues } = loaded;
  const firstSpecies = data && [...data.ecology.keys()][0];
  const view =
    data &&
    firstSpecies &&
    getView(newRun({ speciesId: firstSpecies, seed: 'm0', mode: 'free' }, data), data);
  return (
    <main data-testid="dev-check">
      <h1>야생조류 키우기</h1>
      <p className="muted">개발 빌드 v{versionFile.gameVersion}</p>

      <section>
        <h2>데이터</h2>
        <p data-testid="data-status">
          파일 {fileCount}개 ·{' '}
          {data
            ? '검증 통과'
            : issues.length > 0
              ? `검증 문제 ${issues.length}건`
              : '효과 등급표·공식 계수가 아직 없어 게임 데이터를 묶지 못함'}
        </p>
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

      <section>
        <h2>엔진</h2>
        {view ? (
          <pre data-testid="engine-view">{JSON.stringify(view, null, 2)}</pre>
        ) : (
          <p data-testid="engine-view" className="muted">
            게임 데이터가 준비되면 새 런을 시작해 화면 정보를 보여 준다
          </p>
        )}
      </section>
    </main>
  );
}
