// Accès PostgreSQL. En ligne : Neon (DATABASE_URL). Sur votre Mac sans DATABASE_URL : base d'essai dans .base-locale.
import { DATABASE_URL } from 'astro:env/server';

const SCHEMA = [
  `create table if not exists devis (
    id uuid primary key,
    cree_le timestamptz not null default now(),
    type text not null,
    nom text not null,
    entreprise text not null default '',
    telephone text not null,
    service text not null default '',
    ville text not null default '',
    besoin text not null default '',
    lignes jsonb not null default '[]',
    total bigint not null default 0,
    a_chiffrer boolean not null default false,
    statut text not null default 'nouveau' check (statut in ('nouveau', 'rappele', 'vendu', 'perdu')),
    note text not null default ''
  )`,
  'create index if not exists devis_cree_le on devis (cree_le desc)',
  'create table if not exists limites (cle text primary key, fin timestamptz not null, n int not null)',
];

async function ouvrir() {
  let requete;
  if (DATABASE_URL) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 3, connectionTimeoutMillis: 8000, idleTimeoutMillis: 10000 });
    pool.on('error', (e) => console.error('base :', e.message));
    requete = (t, p) => pool.query(t, p);
  } else if (import.meta.env.DEV) {
    const { PGlite } = await import('@electric-sql/pglite');
    const b = await PGlite.create('./.base-locale');
    requete = (t, p) => b.query(t, p);
  } else {
    throw new Error('DATABASE_URL manquante');
  }
  for (const s of SCHEMA) await requete(s);
  return requete;
}

let pret; // ouverte une seule fois ; on réessaie au prochain appel en cas d'échec
export async function sql(texte, params = []) {
  pret ??= ouvrir().catch((e) => { pret = undefined; throw e; });
  return (await (await pret)(texte, params)).rows;
}

// Vrai si l'action est permise : au plus `max` fois par fenêtre de `secondes`
export async function autoriser(cle, max, secondes) {
  await sql('delete from limites where fin < now()');
  const [l] = await sql(
    `insert into limites (cle, fin, n) values ($1, now() + make_interval(secs => $2), 1)
     on conflict (cle) do update set n = limites.n + 1 returning n`, [cle, secondes]);
  return l.n <= max;
}
export const liberer = (cle) => sql('delete from limites where cle = $1', [cle]);
