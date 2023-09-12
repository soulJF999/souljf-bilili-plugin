import agent from './agent.js';

export async function getDataByUrl(url) {
  const { data } = await agent.get(url);
  const initialStateStr = data.match(/__INITIAL_STATE__=(.*?);/)[1];
  return JSON.parse(initialStateStr);
}
