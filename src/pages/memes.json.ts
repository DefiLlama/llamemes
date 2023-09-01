import { shuffle } from '#/utilities';
import type { APIRoute } from 'astro';

const GITHUB_API_KEY = import.meta.env.GITHUB_API_KEY

if (!GITHUB_API_KEY) throw new Error('Missing GITHUB_API_KEY')

export const GET: APIRoute = async _ => {
  try {
    const response = await fetch('https://api.github.com/repos/defillama/memes/git/trees/master?recursive=1', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_API_KEY}`
      }
    })
    if (!response.ok) throw new Error(`Encountered an error: ${response.status} ${response.statusText}`)

    const data = (await response.json()) as { tree: Array<{ path: string }> }

    const mediaFiles = data.tree
      .filter(file => ['jpg', 'png', 'jpeg', 'gif']
        .some(ext => file.path.endsWith(ext)))
      .map(file => `https://raw.githubusercontent.com/defillama/memes/master/${file.path}`)

    const memes = shuffle(mediaFiles)

    return new Response(JSON.stringify(memes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}