import { sql, autoriser } from '../../server/base.js';
import { empreinte, secretPret } from '../../server/securite.js';
import { valider } from '../../server/devis.js';

export const prerender = false;
const repondre = (status, corps) => new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function POST({ request, clientAddress, url }) {
  if (request.headers.get('origin') !== url.origin) return repondre(403, { erreur: 'Origine refusée.' });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return repondre(415, { erreur: 'Format refusé.' });
  if (!secretPret()) return repondre(503, { erreur: 'Enregistrement non configuré.' });
  let brut;
  try {
    const t = await request.text();
    if (t.length > 20000) return repondre(413, { erreur: 'Demande trop longue.' });
    brut = JSON.parse(t);
  } catch { return repondre(400, { erreur: 'Demande illisible.' }); }
  if (brut?.site) return repondre(201, { ok: true }); // champ invisible rempli : robot
  const { devis: d, erreur } = valider(brut);
  if (erreur) return repondre(400, { erreur });
  try {
    if (!(await autoriser(empreinte('devis', clientAddress), 10, 3600))) return repondre(429, { erreur: 'Trop de demandes. Réessayez plus tard.' });
    await sql(
      `insert into devis (id, type, nom, entreprise, telephone, service, ville, besoin, lignes, total, a_chiffrer)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11) on conflict (id) do nothing`,
      [d.id, d.type, d.nom, d.entreprise, d.telephone, d.service, d.ville, d.besoin, JSON.stringify(d.lignes), d.total, d.a_chiffrer]);
    return repondre(201, { ok: true });
  } catch (e) {
    console.error('devis :', e.message);
    return repondre(503, { erreur: 'Enregistrement indisponible.' });
  }
}
