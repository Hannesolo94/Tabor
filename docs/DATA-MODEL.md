# Data Model (Supabase / Postgres)

All tables have `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`,
and Row Level Security so a user can only read/write their own rows (`user_id = auth.uid()`),
except shared guild content (scoped to guild membership) and public catalog data.

Ported from `proto-state.jsx` (the prototype's state shape).

## profiles
One per auth user.
| column | type | notes |
|---|---|---|
| user_id | uuid pk | references auth.users |
| name | text | display name |
| avatar_url | text | Supabase storage |
| believer | text | 'yes' \| 'seeking' (gate: 'no' cannot pass) |
| cls | text | Sentinel \| Scribe \| Crusader \| Pilgrim |
| denomination | text | Orthodox \| Catholic \| Protestant \| Other |
| journey | text | faith stage from onboarding |
| fitness_level | text | Beginner \| Intermediate \| Advanced |
| equipment | text | Bodyweight only \| Minimal \| Full gym |
| goals | text[] | onboarding goals + callings |
| xp | int | drives level + rank (see GAME-LOGIC) |
| stats | jsonb | { STR, AGI, WIS, MANA } |
| streak | int | current day streak |
| best_streak | int | |
| freezes | int | streak-protect tokens |
| last_active | date | for rollover reconciliation |
| ai_opt_in | bool | System may use their data |
| notif_prefs | jsonb | { rank, nudge, quest, streak, quiet } |
| settings | jsonb | { reduced_motion, sound } |
| onboarded | bool | |
| role | text | 'user' \| 'admin' (admin reaches `/admin`; RLS-enforced) |

## day_history
| user_id | uuid | |
| day | date | |
| status | text | 'sealed' \| 'frozen' \| 'missed' |
PK (user_id, day).

## quests
Daily quest instances (rotate from a pool — see note).
| user_id | uuid | |
| day | date | |
| quest_key | text | scout \| iron \| line (+ future variety) |
| pillar | text | Scripture Raid \| Fitness Guild \| Brotherhood |
| title, sub | text | |
| stat | text | which stat it feeds |
| xp | int | reward |
| done | bool | |
| progress | int | for partial quests (e.g. steps) |
| goal | int | e.g. 7500 steps |

## notes
| user_id | uuid | |
| cat | text | scripture \| fitness |
| title, body | text | |
| ref | text | optional verse/workout ref |

## bookmarks
| user_id | uuid | ref text (e.g. "John 1:5") | PK (user_id, ref) |

## workouts
| user_id | uuid | name text | mins int | day date | meta jsonb |

## personal_records
| user_id | uuid | lift text | value text | PK (user_id, lift) |

## tabata_presets
| user_id | uuid | name text | work int | rest int | rounds int | moves text[] |

## achievements
| user_id | uuid | achievement_id text | unlocked_at timestamptz | PK (user_id, achievement_id) |

## seeker_progress
| user_id | uuid | lesson_id text | completed_at timestamptz | PK (user_id, lesson_id) |

## guilds
| id | uuid | name text | tag text | created_by uuid | open bool |

## guild_members
| guild_id | uuid | user_id uuid | role text | (Warlord \| Officer \| Brother \| Recruit) | joined_at |
PK (guild_id, user_id).

## channels
| id | uuid | guild_id uuid | name text | topic text | locked bool |

## messages  (Realtime enabled)
| id | uuid | channel_id uuid (nullable) | dm_thread_id uuid (nullable) | guild_id uuid | author_id uuid | body text | kind text ('user' \| 'system') | created_at |

## dm_threads
| id | uuid | guild_id uuid | is_group bool | name text |
plus `dm_participants(thread_id, user_id)`.

## reactions
| message_id | uuid | user_id uuid | emoji text | PK (message_id, user_id, emoji) |

## notifications
| user_id | uuid | kind text (rank\|nudge\|guild\|quest\|streak) | title text | body text | read bool | deep_link text |

## giveaways
| id | uuid | month text | prize text | product_sku text | closes_at timestamptz |
## giveaway_nominees
| giveaway_id | uuid | user_id uuid |
## giveaway_votes
| giveaway_id | uuid | voter_id uuid | nominee_id uuid | PK (giveaway_id, voter_id) | (one vote each) |

## products  (catalog cache from Printful)
| sku | text pk | printful_id text | name text | collection text (sentinel\|crusader\|scribe\|pilgrim) | note text | image_url text | status text ('draft'\|'live') | sort int |

## price_books / product_prices  (per-region pricing — see COMMERCE.md)
`price_books(region text pk, currency text)` · `product_prices(sku text, region text, price numeric, PK (sku, region))`

## suppliers / product_suppliers  (multi-supplier fulfilment)
`suppliers(id uuid, name text, regions text[])` · `product_suppliers(sku text, supplier_id uuid, supplier_variant_id text)`

## content  (data-driven CMS — editable page copy/images)
| key | text pk | value jsonb | (hero, marquee, creed, banners, etc.) |

## orders
| id | uuid | user_id uuid (nullable for guest) | printful_order_id text | supplier text | region text | currency text | status text | total numeric | items jsonb |

## waitlist
| email text pk | source text | created_at |

### Notes
- **Quest variety**: keep a static `quest_pool` (seed/JSON or table); `daily-rollover` picks the day's
  three (one per pillar). MVP can hardcode scout/iron/line like the prototype.
- **delete-account** Edge Function must delete all rows for the user across every table, then the auth user.
- Scripture text / reading plans / prayers: source from a Bible API at runtime; do not store full Bible text.
