import { requireChatGPTUser } from './chatgpt-auth';
import { STUDY_HTML } from './study-shell';
export const dynamic = 'force-dynamic';
export default async function Home() {
  await requireChatGPTUser('/');
  return <><div dangerouslySetInnerHTML={{__html:STUDY_HTML}}/><script type="module" src="/app.js"/></>;
}
