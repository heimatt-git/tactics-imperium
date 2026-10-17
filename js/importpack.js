// Éditeur privé : importer un « paquet » fabriqué par le convertisseur 40k → Dust Imperium.
// Le paquet (.zip) contient units-a-ajouter.json, photos-a-ajouter.json, (factions-a-ajouter.json) et un dossier photos/.
// Rien n'est envoyé sur GitHub ici : les fiches vont dans le brouillon, on publie ensuite dans l'onglet « Publier ».
import { esc, toast, openModal } from './ui.js';
import { blobs } from './proposals.js';

let X; // contexte : { E, saveDraft, render, clone }
export function initImportPack(ctx) { X = ctx; }

// ---------------------------------------------------------------- Lecture du .zip
async function readZip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let e = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("Ce fichier n'est pas un .zip valide.");
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const dec = new TextDecoder();
  const out = new Map();
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Zip abîmé.');
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    if (name.endsWith('/')) continue;
    const lh = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    let data = u8.slice(lh, lh + csize);
    if (method === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('Ce navigateur ne sait pas décompresser ce zip.');
      data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    } else if (method !== 0) throw new Error('Zip : méthode de compression non gérée.');
    out.set(name, data);
  }
  return out;
}

// ---------------------------------------------------------------- Résumé d'une unité
const sum = (u) => `${u.cost} pts · santé ${u.health ?? '–'} · armure ${u.armor ?? '–'} · ${(u.weapons || []).length} arme(s) · ${(u.skills || []).length} compétence(s)`;

// ---------------------------------------------------------------- Import
export async function importPackFile(file) {
  const { E } = X;
  let z;
  try { z = await readZip(await file.arrayBuffer()); } catch (e) { return toast(e.message); }
  const find = (tail) => [...z.keys()].find((k) => k.endsWith(tail));
  const getJson = (tail) => { const k = find(tail); return k ? JSON.parse(new TextDecoder().decode(z.get(k))) : null; };
  let units, photos, facs;
  try { units = getJson('units-a-ajouter.json')?.units; photos = getJson('photos-a-ajouter.json') || {}; facs = getJson('factions-a-ajouter.json')?.factions || []; }
  catch (e) { return toast('Paquet illisible : ' + e.message); }
  if (!Array.isArray(units) || !units.length) return toast("Ce zip ne ressemble pas à un paquet du convertisseur (units-a-ajouter.json introuvable).");

  const cur = new Map(E.d.unitsFile.units.map((u) => [u.id, u]));
  const items = units.map((u) => ({ u, old: cur.get(u.id) || null }));
  const newFacs = facs.filter((f) => { const b = E.d.blocsFile.blocs.find((x) => x.id === f.bloc); return b && !(b.factions || []).some((x) => x.id === f.faction.id); });

  openModal(`<h2 style="margin-top:0">Importer le paquet « ${esc(file.name)} »</h2>
    <p class="hint">${units.length} fiche(s). Décochez celles que vous ne voulez pas. Rien n'est mis en ligne : tout va dans le brouillon, puis vous publiez dans l'onglet « Publier ».</p>
    ${newFacs.length ? `<p class="hint"><b>Nouvelles factions ajoutées au bloc :</b> ${newFacs.map((f) => esc(f.faction.name)).join(', ')}</p>` : ''}
    <div style="max-height:52vh;overflow:auto;border:1px solid var(--line);border-radius:8px">
      <table style="width:100%;font-size:13px;border-collapse:collapse">${items.map((it, i) => `
        <tr style="border-bottom:1px solid var(--line)"><td style="padding:6px"><input type="checkbox" data-ip="${i}" checked></td>
        <td style="padding:6px"><b>${esc(it.u.name)}</b> <span class="hint">${esc(it.u.id)}</span><br>
          <span class="hint">${it.old ? `<b style="color:#d9a441">REMPLACE</b> — avant : ${esc(sum(it.old))}<br>après : ${esc(sum(it.u))}` : `<b style="color:#5bbf7a">NOUVELLE</b> — ${esc(sum(it.u))}`}${photos[it.u.id] ? ' · + photo' : ' · pas de photo'}</span></td></tr>`).join('')}
      </table></div>
    <p style="margin:12px 0 0;display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-close-btn>Annuler</button><button class="btn primary" id="ip-go">Ajouter au brouillon</button></p>`,
  (back, close) => {
    back.querySelector('#ip-go').addEventListener('click', async () => {
      const picked = items.filter((_, i) => back.querySelector(`[data-ip="${i}"]`).checked);
      if (!picked.length) return toast('Aucune fiche cochée.');
      let nNew = 0, nRep = 0, nPh = 0;
      // factions manquantes (seulement si une fiche cochée les utilise)
      for (const f of newFacs) {
        if (!picked.some((it) => it.u.faction === f.faction.id && it.u.bloc === f.bloc)) continue;
        const b = E.d.blocsFile.blocs.find((x) => x.id === f.bloc);
        (b.factions ||= []).push(X.clone(f.faction));
      }
      for (const it of picked) {
        const list = E.d.unitsFile.units;
        const k = list.findIndex((x) => x.id === it.u.id);
        if (k >= 0) { list[k] = X.clone(it.u); nRep++; } else { list.push(X.clone(it.u)); nNew++; }
        const ph = photos[it.u.id];
        if (ph?.length) {
          const keep = (E.d.photos[it.u.id] || []).filter((p) => !ph.some((q) => q.file === p.file));
          for (const rec of ph) {
            const bytes = z.get(find('/' + rec.file)) || z.get(rec.file);
            if (!bytes) continue;
            const type = rec.file.endsWith('.webp') ? 'image/webp' : rec.file.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const blob = new Blob([bytes], { type });
            E.pending.set(rec.file, blob);
            await blobs.set('pending:' + rec.file, blob).catch(() => {});
            keep.push(X.clone(rec)); nPh++;
          }
          E.d.photos[it.u.id] = keep;
        }
      }
      X.saveDraft(); close(); X.render();
      toast(`${nNew} ajoutée(s), ${nRep} remplacée(s), ${nPh} photo(s) : à publier dans l'onglet Publier.`);
    });
  });
}
