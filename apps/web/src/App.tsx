import versionFile from '../../../version.json';
import { fileCount, loaded } from './data.ts';
import { Game } from './Game.tsx';

/**
 * 데이터 묶음이 검증을 통과하면 게임(#24)을, 아니면 무엇이 문제인지를 보여 준다.
 * 개발 확인용 안내라 문구를 data/text/로 옮기지 않았다.
 */
export function App() {
  const { data, issues } = loaded;
  if (data) return <Game data={data} />;
  return (
    <main className="dev" data-testid="dev-check">
      <h1>야생조류 키우기</h1>
      <p className="muted">개발 빌드 v{versionFile.gameVersion}</p>
      <p data-testid="data-status">
        파일 {fileCount}개 ·{' '}
        {issues.length > 0
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
    </main>
  );
}
