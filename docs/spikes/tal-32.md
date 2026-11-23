# TAL-32 — localStorage capacity limits and FastAPI/PostgreSQL sync design

## Question

1. **AC1** — How much data do five full games (many rounds, many players) occupy in `localStorage`, and is the typical 5 MB browser limit likely to be exceeded?
2. **AC2** — If it is likely to be exceeded, what fallback should we use (IndexedDB, pruning, …)?
3. **AC3** — What is the minimal API contract for the FastAPI sync endpoint, the initial PostgreSQL schema with Alembic migrations, and is it confirmed that localStorage always wins on conflict?

"Likely exceeded" is defined here as: projected usage above **50 % of the quota**, because the origin's quota is shared with everything else the app stores and the worst case is an assumption, not a measurement.

## What was tried

- Listed the repository (`git ls-files`): it holds only a Vite/React scaffold under `web/` (`App.tsx`, `main.tsx`, tests). There is **no game, round or player model, no `contracts/` directory and no `api/` directory**. The sizing therefore rests on an explicit worst-case model stated below, not on real data.
- Built that worst-case model in Node 22 and measured `JSON.stringify(...).length` for two storage layouts (verbose and compact). Scripts are reproduced in Evidence so anyone can rerun them.
- Drafted the API contract, schema, SQLAlchemy models and Alembic revision as text. Nothing was installed or run against PostgreSQL; the Alembic and SQLAlchemy code below is **unexecuted** and must be tested when it becomes real files.

## Evidence

### E1. Browser quota facts (sources to check, not measured here)

- `localStorage` stores strings; JavaScript strings are UTF-16, so one character counts as one code unit and two bytes. Source: Web Storage spec, https://html.spec.whatwg.org/multipage/webstorage.html, and MDN "Storage quotas and eviction criteria".
- Chromium and Firefox: about 5 MiB (5,242,880) code units per origin (commonly quoted as "5 MB / 10 MB"; MDN, and the `QuotaExceededError` behaviour documented there). Safari / iOS: reported as about 5 MB counted in bytes, i.e. roughly **2.5 M code units**; private modes may be lower. These figures vary by version, so the cheap check is: in the target browser's console run `let n=0;try{for(;;n+=1e5)localStorage.setItem('k',"x".repeat(n))}catch(e){console.log(n)}` and `localStorage.clear()` afterwards. I have not run it (no browser in this environment).
- I therefore evaluate against both **5,242,880 units** (Chromium/Firefox) and a pessimistic **2,500,000 units** (Safari read as 5 MB of UTF-16 bytes).

### E2. Worst-case model (assumption, stated so it can be challenged)

| Parameter | Value |
|---|---|
| Games stored | 5 |
| Players per game | 12 (names about 28 characters, UUID ids) |
| Rounds per game | 300 |
| Score entries | 12 × 300 = 3,600 per game, 18,000 in total |
| Verbose score entry | `{"playerId":"<uuid36>","points":-125,"enteredAt":"<ISO 24>"}` = **104 characters** |

### E3. Measurement — verbose layout (per-score id and timestamp)

Script `size.mjs` (run with `node size.mjs`):

```js
import {randomUUID} from 'node:crypto';
const G=5,P=12,R=300;
const players=Array.from({length:P},(_,i)=>({id:randomUUID(),name:'Player '+String(i+1).padStart(2,'0')+' with a long name'}));
const mk=()=>({id:randomUUID(),title:'Game',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),players,
 rounds:Array.from({length:R},(_,n)=>({id:randomUUID(),number:n+1,scores:players.map(p=>({playerId:p.id,points:-125,enteredAt:new Date().toISOString()}))}))});
const s=JSON.stringify({version:1,games:Array.from({length:G},mk)});
console.log('code units',s.length,'bytes UTF-16',s.length*2,'pct of 5Mi units',(s.length/5242880*100).toFixed(1));
```

Output observed:

```
code units 2000213 bytes UTF-16 4000426 pct of 5M units 38.2 pct of 5,000,000 40.0
score entry 104
```

| Quota basis | Usage | Over the 50 % line? |
|---|---|---|
| Chromium/Firefox, 5,242,880 units | 2,000,213 = **38.2 %** | No, but within about 1.3× of it |
| Safari pessimistic, 2,500,000 units | **80.0 %** | **Yes** |

Note: this is higher than the roughly 1.2 M units I expected before measuring. The cause is the per-score UUID and ISO timestamp (about 60 of the 104 characters). The measurement replaced the estimate.

### E4. Measurement — compact layout (rounds as arrays of points in player order)

Script `size2.mjs` is the same model with `rounds: Array.from({length:R}, () => players.map(() => -125))`. Output observed:

```
compact code units 98753 1.9% of 5Mi; safari-strict 2.5M units: 4.0%
```

The compact layout is about **20× smaller**. Caveat: all-`-125` scores are the same length as typical 3-digit scores; larger numbers add a few characters per entry, so treat 98,753 as a floor, in the low hundreds of thousands at most.

### E5. Sensitivities (arithmetic from E3)

- Verbose size is roughly linear: about 111 units per score entry. Reaching 50 % of 5,242,880 units needs about 23,600 entries, i.e. about 6,500 rounds across five games with 12 players, or 36 players at the same 300 rounds.
- Free-text notes, undo history or per-round timestamps added later would be additive; none exist today.

## Recommendation

### R1. AC1 — sizing assessment

- With the verbose layout, five maximal games take about **2.0 M code units (about 4.0 MB as UTF-16 bytes)**. That is 38 % of the Chromium/Firefox quota, so **the 5 MB limit is not likely to be exceeded** there, but it is **likely to cross the 50 % line on Safari** (80 %), and `localStorage` quota is per origin, shared with anything else we store.
- With the compact layout it is about 99 k units (2–4 %), which is not a concern anywhere.
- Conclusion: **not an immediate production problem if we store the compact layout; a real risk if we store per-score ids and timestamps.** Decide the layout first. Recommended: store `rounds` as arrays of points; keep ids and timestamps at game level only.

### R2. AC2 — fallback strategy

In order of preference; stop at the first that suffices.

1. **Compact layout** (above). Removes the problem for the assumed model.
2. **Prune/archive finished games.** Once measured usage (`JSON.stringify(state).length`) passes a soft threshold (suggest 40 % of 2,500,000 units = 1,000,000), keep the 5 most recently updated games active and move older finished games to the server (already synced) and out of `localStorage`. Pruning must be a deliberate client action that only removes games the server has acknowledged; see Open question 4.
3. **Fail loudly on quota.** Wrap every `setItem` in a function that catches `QuotaExceededError` (`DOMException` name) and surfaces it to the UI and logs it. Never swallow it: a write that went nowhere must not look like success.
4. **Move to IndexedDB** only if the model grows past the pruning headroom (trigger: compact layout over 50 % of 2.5 M units with 5 games, or any need for notes/undo history). Use the **native IndexedDB API behind a storage port** so the swap is an adapter change. No wrapper library, so no stack deviation (`idb`, `localforage` and `dexie` are not on the approved list). IndexedDB quotas are a share of disk (typically hundreds of MB or more), and it is asynchronous, so the port must be async from day one to avoid a later signature change.

### R3. AC3 — minimal API contract (to live in `contracts/sync-v1.yaml` once created)

```yaml
openapi: 3.1.0
info: {title: Game sync, version: 1.0.0}
paths:
  /v1/sync:
    post:
      summary: Upsert games from the client. Client state always wins.
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/SyncRequest'}
      responses:
        '200': {description: Applied (idempotent), content: {application/json: {schema: {$ref: '#/components/schemas/SyncResponse'}}}}
        '400': {description: Malformed body}
        '401': {description: Not authenticated (see Open questions)}
        '413': {description: Payload too large}
        '422': {description: Schema validation failed}
components:
  schemas:
    SyncRequest:
      type: object
      required: [schema_version, games]
      properties:
        schema_version: {const: 1}
        games:
          type: array
          maxItems: 5
          items: {$ref: '#/components/schemas/Game'}
    Game:
      type: object
      required: [id, updated_at, players, rounds]
      properties:
        id: {type: string, format: uuid}          # idempotency key
        title: {type: string, maxLength: 120}
        updated_at: {type: string, format: date-time}   # client clock, audit only
        players:
          type: array
          items:
            type: object
            required: [id, name]
            properties: {id: {type: string, format: uuid}, name: {type: string, maxLength: 60}}
        rounds:        # rounds[r][p] = points of players[p] in round r
          type: array
          items: {type: array, items: {type: integer}}
    SyncResponse:
      type: object
      required: [accepted_game_ids, server_received_at]
      properties:
        accepted_game_ids: {type: array, items: {type: string, format: uuid}}
        server_received_at: {type: string, format: date-time}
```

Semantics: the call is idempotent per `Game.id`; repeating it yields the same stored state. A game present in the body replaces the stored game wholesale (players, rounds and scores). A game **absent** from the body is left untouched (never deleted); see Open question 4. Changes to the contract are a new path (`/v2/sync`); consumers pin a copy of the file and fail CI on drift, per the standard.

### R4. AC3 — PostgreSQL schema (owned by the sync service, own schema and DB role)

Tables, all in schema `sync`, readable only by the sync service's role:

| Table | Columns | Notes |
|---|---|---|
| `games` | `id uuid PK`, `title text`, `client_updated_at timestamptz`, `server_received_at timestamptz` | the two timestamps are audit only |
| `players` | `id uuid PK`, `game_id uuid FK→games ON DELETE CASCADE`, `name text`, `seat int` | `UNIQUE(game_id, seat)` |
| `rounds` | `id uuid PK`, `game_id uuid FK ON DELETE CASCADE`, `number int` | `UNIQUE(game_id, number)` |
| `scores` | `round_id uuid FK ON DELETE CASCADE`, `player_id uuid FK ON DELETE CASCADE`, `points int` | `PK(round_id, player_id)` |

`scores` has 18,000 rows for the worst case in E2, which is small for PostgreSQL. Players and rounds get server-generated UUIDs; the client contract does not carry round ids (compact layout). Indexes: the PKs plus `players(game_id)` and `rounds(game_id)`.

SQLAlchemy 2.x async models (sketch, **unexecuted**; driver `postgresql+asyncpg`, URL read from the environment, never committed):

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    metadata = MetaData(schema="sync")   # from sqlalchemy import MetaData

class GameRecord(Base):
    __tablename__ = "games"
    id: Mapped[UUID] = mapped_column(primary_key=True)
    title: Mapped[str]
    client_updated_at: Mapped[datetime]
    server_received_at: Mapped[datetime]

class PlayerRecord(Base):
    __tablename__ = "players"
    __table_args__ = (UniqueConstraint("game_id", "seat"),)
    id: Mapped[UUID] = mapped_column(primary_key=True)
    game_id: Mapped[UUID] = mapped_column(ForeignKey("sync.games.id", ondelete="CASCADE"), index=True)
    name: Mapped[str]
    seat: Mapped[int]

class RoundRecord(Base):
    __tablename__ = "rounds"
    __table_args__ = (UniqueConstraint("game_id", "number"),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    game_id: Mapped[UUID] = mapped_column(ForeignKey("sync.games.id", ondelete="CASCADE"), index=True)
    number: Mapped[int]

class ScoreRecord(Base):
    __tablename__ = "scores"
    round_id: Mapped[UUID] = mapped_column(ForeignKey("sync.rounds.id", ondelete="CASCADE"), primary_key=True)
    player_id: Mapped[UUID] = mapped_column(ForeignKey("sync.players.id", ondelete="CASCADE"), primary_key=True)
    points: Mapped[int]
```

Alembic revision `0001_create_sync_schema` (sketch, **unexecuted**; reversible, no DDL at startup; `env.py` must use `version_table_schema="sync"` and an async engine from the environment):

```python
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None

def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS sync")
    op.create_table("games",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("client_updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("server_received_at", sa.DateTime(timezone=True), nullable=False),
        schema="sync")
    op.create_table("players",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("game_id", sa.Uuid, sa.ForeignKey("sync.games.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("seat", sa.Integer, nullable=False),
        sa.UniqueConstraint("game_id", "seat"), schema="sync")
    op.create_index("ix_players_game_id", "players", ["game_id"], schema="sync")
    op.create_table("rounds",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("game_id", sa.Uuid, sa.ForeignKey("sync.games.id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.Integer, nullable=False),
        sa.UniqueConstraint("game_id", "number"), schema="sync")
    op.create_index("ix_rounds_game_id", "rounds", ["game_id"], schema="sync")
    op.create_table("scores",
        sa.Column("round_id", sa.Uuid, sa.ForeignKey("sync.rounds.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("player_id", sa.Uuid, sa.ForeignKey("sync.players.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("points", sa.Integer, nullable=False), schema="sync")

def downgrade() -> None:
    op.drop_table("scores", schema="sync")
    op.drop_table("rounds", schema="sync")
    op.drop_table("players", schema="sync")
    op.drop_table("games", schema="sync")
    op.execute("DROP SCHEMA sync")
```

All of `fastapi`, `sqlalchemy`, `alembic`, `asyncpg` and `pydantic` are on the approved Python stack, so no deviation is introduced. Adding `alembic.ini`, migrations and `pyproject.toml` later will need a `pacca: deploy-change` statement in that story.

### R5. AC3 — conflict resolution (confirmed)

**localStorage always wins on conflict.** On `POST /v1/sync` the server overwrites the stored game with the request body unconditionally: no version comparison, no merge, no `409`. `client_updated_at` (client clock) and `server_received_at` (server clock) are stored for audit only and never used to decide a winner. Consequence, stated plainly: with more than one device per user, the last device to sync silently overwrites the others (Open question 3).

### R6. Follow-up stories (this spike changes only this file)

1. Create `contracts/sync-v1.yaml` and a client-side pinned copy with a drift test.
2. Create `api/` with the models and migration above, with tests that run `upgrade` then `downgrade` against a real PostgreSQL.
3. Add a storage port with a `localStorage` adapter, the quota-error handling and the compact layout in `web/`.

## Open questions

1. **Authentication and identity.** Who owns a game? The contract has a `401` but no auth scheme and the schema has no `owner_id`. Needs a decision before any real data is stored. Names are personal data, so retention and deletion need thought too.
2. **Real quotas.** The Safari and private-mode figures come from documentation, not from a device test; run the console probe in E1 on the target browsers.
3. **Multiple devices per user.** "Client always wins" loses data when two devices diverge. Is single-device a product guarantee? If not, a per-game revision number is the smallest change, and it would revisit this rule.
4. **Deletion and absence.** The contract treats an absent game as "leave alone", so a game pruned on the client stays on the server, and a game deleted by the user on the client is never deleted on the server. A tombstone (`deleted: true`) or an explicit `DELETE /v1/games/{id}` is needed, along with a way to restore pruned games from the server.
5. **Real data model.** Once a game model exists, rerun `size.mjs` against it; the 50 % conclusion depends on the assumptions in E2, notably the layout in R1.
6. **Payload ceiling.** The `413` limit and `maxItems: 5` should be derived from the real model; compact worst case is about 100 kB, verbose about 2 MB.
