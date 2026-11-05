# Activer le classement en ligne (environ 5 minutes, gratuit)

Le jeu est hébergé sur GitHub Pages, qui ne sait pas stocker de données. Pour que les pseudos soient uniques
pour **tous** les joueurs et que le classement soit partagé, il faut une petite base de données en ligne.
On utilise **Supabase**, gratuit pour ce volume.

Tant que ce n'est pas fait, le jeu fonctionne quand même. L'onglet Classement (touche **O**) indique alors
« classement local » : les scores restent dans le navigateur.

## Étapes

1. Créez un compte sur https://supabase.com, puis un projet. Le nom et le mot de passe n'ont pas d'importance.
2. Dans le projet, ouvrez **SQL Editor**, collez tout le bloc ci-dessous, puis cliquez sur **Run**.
3. Ouvrez **Project Settings → API** et copiez deux valeurs : la **Project URL** et la clé **anon public**.
4. Dans le dépôt GitHub, ouvrez `js/online/config.js`, cliquez sur le crayon (modifier) et remplissez :
   ```js
   export const ONLINE = { url: 'https://VOTRE-PROJET.supabase.co', anonKey: 'VOTRE-CLE-ANON' };
   ```
   Validez (« Commit changes »). Une minute plus tard, le classement du site est en ligne.

La clé « anon » est faite pour être publique. Les joueurs ne peuvent rien toucher directement : tout passe par les
deux fonctions ci-dessous. L'une réserve un pseudo libre, l'autre met à jour un score, et seulement si l'on
détient le jeton secret du pseudo.

```sql
create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists players (
  pseudo citext primary key,
  token_hash text not null,
  level int not null default 1, renown int not null default 0, kills int not null default 0,
  quests int not null default 0, playtime int not null default 0,
  updated_at timestamptz not null default now()
);
alter table players enable row level security; -- aucun accès direct : tout passe par les fonctions

create or replace view leaderboard as select pseudo::text as pseudo, level, renown, kills, quests from players;
grant select on leaderboard to anon;

create or replace function claim_pseudo(p_pseudo text, p_token text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_pseudo !~ '^[[:alnum:]_ -]{3,20}$' or length(p_token) < 32 then return false; end if;
  insert into players(pseudo, token_hash) values (p_pseudo, encode(digest(p_token, 'sha256'), 'hex'));
  return true;
exception when unique_violation then return false;
end $$;

create or replace function submit_score(p_pseudo text, p_token text, p_level int, p_renown int, p_kills int, p_quests int, p_playtime int)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  update players set level = least(p_level, 100), renown = least(p_renown, 100000), kills = least(p_kills, 1000000),
    quests = least(p_quests, 10000), playtime = p_playtime, updated_at = now()
  where pseudo = p_pseudo and token_hash = encode(digest(p_token, 'sha256'), 'hex');
  return found;
end $$;

grant execute on function claim_pseudo(text, text) to anon;
grant execute on function submit_score(text, text, int, int, int, int, int) to anon;
```

## Limites honnêtes

Le jeu tourne entièrement dans le navigateur. Un joueur très motivé peut donc trafiquer son propre score, par
exemple en modifiant sa sauvegarde. Les fonctions plafonnent les valeurs absurdes. En revanche, personne ne peut
voler le pseudo d'un autre ni modifier son score.
