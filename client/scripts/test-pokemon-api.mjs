/**
 * Pokémon API security & stability tests (mocked fetch — no live PokeAPI).
 * Imports the public SSOT entry: entities/Pokemon/api.js
 * Run: npm run test:pokemon-api
 */
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiPath = path.join(__dirname, '../src/entities/Pokemon/api.js')
const getJSONPath = path.join(__dirname, '../src/api/getJSON.js')

let fetchImpl = null
let fetchCalls = []
globalThis.fetch = (...args) => {
  fetchCalls.push(args)
  if (!fetchImpl) throw new Error('fetch mock not set')
  return fetchImpl(...args)
}

const { getJSON } = await import(pathToFileURL(getJSONPath).href)
const { list, get, parseKey } = await import(pathToFileURL(apiPath).href)

const POKE_HOST = 'https://pokeapi.co/api/v2/'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function textResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError('Unexpected token')
    },
  }
}

function samplePokemon(overrides = {}) {
  return {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    types: [{ type: { name: 'grass' } }],
    sprites: {
      front_default:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
    species: { url: `${POKE_HOST}pokemon-species/1/` },
    stats: [{ base_stat: 45, stat: { name: 'hp' } }],
    ...overrides,
  }
}

function sampleSpecies() {
  return {
    capture_rate: 45,
    gender_rate: 1,
    flavor_text_entries: [
      { language: { name: 'en' }, flavor_text: 'A seed Pokémon.' },
    ],
    evolution_chain: { url: `${POKE_HOST}evolution-chain/1/` },
  }
}

function sampleChain() {
  return {
    chain: {
      species: { name: 'bulbasaur', url: `${POKE_HOST}pokemon-species/1/` },
      evolution_details: [],
      evolves_to: [],
    },
  }
}

function sampleType(name = 'grass') {
  return {
    name,
    damage_relations: {
      double_damage_from: [{ name: 'fire' }, { name: 'ice' }],
    },
  }
}

/** Route mocks by PokeAPI path so get() multi-step calls stay deterministic. */
function mockPokeApi(pokemonBody = samplePokemon()) {
  return async (url) => {
    const u = String(url)
    assert.ok(u.startsWith(POKE_HOST), `unexpected host: ${u}`)
    if (u.includes('/pokemon-species/')) return jsonResponse(sampleSpecies())
    if (u.includes('/evolution-chain/')) return jsonResponse(sampleChain())
    if (u.includes('/type/')) return jsonResponse(sampleType())
    if (u.includes('/pokemon?')) return jsonResponse({ count: 0, results: [] })
    return jsonResponse(pokemonBody)
  }
}

let passed = 0
async function test(name, fn) {
  try {
    fetchImpl = null
    fetchCalls = []
    await fn()
    passed += 1
    console.log('ok -', name)
  } catch (err) {
    console.error('FAIL -', name)
    console.error(err)
    process.exitCode = 1
  }
}

function assertOnlyPokeApiHost() {
  for (const [url] of fetchCalls) {
    assert.ok(String(url).startsWith(POKE_HOST), `expected PokeAPI host, got: ${url}`)
  }
}

await test('parseKey accepts trimmed name and positive ID', () => {
  assert.equal(parseKey('  Bulbasaur '), 'bulbasaur')
  assert.equal(parseKey('25'), '25')
  assert.equal(parseKey('mr-mime'), 'mr-mime')
})

await test('parseKey rejects empty and whitespace', () => {
  assert.throws(() => parseKey(''), /Enter/)
  assert.throws(() => parseKey('   '), /Enter/)
  assert.throws(() => parseKey(null), /Enter/)
  assert.throws(() => parseKey(undefined), /Enter/)
})

await test('parseKey rejects path injection and unsafe keys (no fetch)', async () => {
  const bad = ['../admin', '..', './x', 'a/b', 'a?x=1', 'a#b', 'http://evil', 'javascript:alert(1)', '<script>', '0', '01', '-1']
  for (const value of bad) assert.throws(() => parseKey(value), Error)
  await assert.rejects(() => get('../admin'), Error)
  await assert.rejects(() => get('http://evil.example/p'), Error)
  assert.equal(fetchCalls.length, 0, 'invalid keys must not call fetch')
})

await test('get always requests fixed PokeAPI base (no open redirect)', async () => {
  fetchImpl = mockPokeApi(samplePokemon({ name: 'pikachu', id: 25, species: { url: `${POKE_HOST}pokemon-species/25/` } }))
  await get('25')
  await get('Pikachu')
  assertOnlyPokeApiHost()
})

await test('get encodes path segment', async () => {
  fetchImpl = mockPokeApi(samplePokemon({ id: 122, name: 'mr-mime' }))
  const p = await get('Mr-Mime')
  assert.ok(fetchCalls.some(([url]) => /\/pokemon\/mr-mime$/.test(String(url))))
  assert.equal(p.name, 'mr-mime')
  assertOnlyPokeApiHost()
})

await test('list pagination uses limit/offset on PokeAPI only', async () => {
  fetchImpl = async (url) => {
    assert.match(String(url), /limit=20&offset=20/)
    return jsonResponse({
      count: 1302,
      next: null,
      previous: null,
      results: [{ name: 'spearow', url: `${POKE_HOST}pokemon/21/` }],
    })
  }
  const page = await list({ limit: 20, offset: 20 })
  assert.equal(page.count, 1302)
  assert.equal(page.results[0].name, 'spearow')
  assertOnlyPokeApiHost()
})

await test('list rejects unsafe page sizes (no fetch)', async () => {
  await assert.rejects(() => list({ limit: 0, offset: 0 }), /limit/)
  await assert.rejects(() => list({ limit: 51, offset: 0 }), /limit/)
  await assert.rejects(() => list({ limit: 20, offset: -1 }), /offset/)
  await assert.rejects(() => list({ limit: 1.5, offset: 0 }), /limit/)
  assert.equal(fetchCalls.length, 0)
})

await test('get returns parsed Pokémon fields + related detail', async () => {
  fetchImpl = mockPokeApi()
  const p = await get('bulbasaur')
  assert.equal(p.id, 1)
  assert.equal(p.name, 'bulbasaur')
  assert.deepEqual(p.types, ['grass'])
  assert.ok(p.sprite.startsWith('https://'))
  assert.equal(p.description, 'A seed Pokémon.')
  assert.equal(p.captureRate, 45)
  assert.ok(p.weaknesses.includes('fire'))
  assertOnlyPokeApiHost()
})

await test('unsafe sprite URLs are dropped', async () => {
  const cases = [
    'https://evil.example/a.png',
    'http://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    'javascript:alert(1)',
    'data:image/png;base64,aaa',
    '//evil.example/x.png',
  ]
  for (const front_default of cases) {
    fetchCalls = []
    fetchImpl = mockPokeApi(samplePokemon({ sprites: { front_default } }))
    const p = await get('1')
    assert.equal(p.sprite, null, `sprite should be null for ${front_default}`)
  }
})

await test('trusted https sprite is kept', async () => {
  fetchImpl = mockPokeApi()
  const p = await get('1')
  assert.match(p.sprite, /^https:\/\/raw\.githubusercontent\.com\//)
})

await test('incomplete or malformed Pokémon body is rejected', async () => {
  fetchImpl = async () => jsonResponse({ name: 'x' })
  await assert.rejects(() => get('x'), /Incomplete/)
  fetchImpl = async () => jsonResponse(null)
  await assert.rejects(() => get('1'), /Unexpected/)
})

await test('unexpected list shape is rejected', async () => {
  fetchImpl = async () => jsonResponse({ count: 1 })
  await assert.rejects(() => list(), /Unexpected list/)
})

await test('bad type entries are filtered out', async () => {
  fetchImpl = mockPokeApi(
    samplePokemon({
      types: [{ type: { name: 'fire' } }, { type: null }, null, { type: { name: 1 } }],
    }),
  )
  const p = await get('4')
  assert.deepEqual(p.types, ['fire'])
})

await test('HTTP 404 becomes error', async () => {
  fetchImpl = async () => jsonResponse({}, 404)
  await assert.rejects(() => get('missingno'), /HTTP 404/)
})

await test('HTTP 500 becomes error', async () => {
  fetchImpl = async () => jsonResponse({}, 500)
  await assert.rejects(() => get('1'), /HTTP 500/)
})

await test('invalid JSON is handled', async () => {
  fetchImpl = async () => textResponse()
  await assert.rejects(() => getJSON(`${POKE_HOST}pokemon/1`), /Invalid JSON/)
})

await test('network failure maps to friendly error', async () => {
  fetchImpl = async () => {
    throw new TypeError('Failed to fetch')
  }
  await assert.rejects(() => getJSON(`${POKE_HOST}pokemon/1`), /Network error/)
})

await test('abort rejects with AbortError', async () => {
  const controller = new AbortController()
  fetchImpl = async (_url, opts) =>
    new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        const e = new Error('aborted')
        e.name = 'AbortError'
        reject(e)
      })
    })
  const pending = getJSON(`${POKE_HOST}pokemon/1`, { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, (err) => err.name === 'AbortError')
})

await test('timeout aborts slow requests', async () => {
  fetchImpl = async (_url, opts) =>
    new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        const e = new Error('aborted')
        e.name = 'AbortError'
        reject(e)
      })
    })
  await assert.rejects(
    () => getJSON(`${POKE_HOST}pokemon/1`, { timeoutMs: 30 }),
    (err) => err.name === 'AbortError' && /timeout/i.test(err.message),
  )
})

if (process.exitCode) console.error('\nSome tests failed')
else console.log('\n' + passed + ' tests passed')
