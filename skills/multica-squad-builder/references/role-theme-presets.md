# Role Theme Presets

Use this reference when the user asks for themed squad roles, meme roles, cultural role flavor, IP-inspired squads, or a preset role theme library.

Role themes are a display and memory aid. They may influence names, short descriptions, and tone hints in a setup pack. They must not change the core Multica squad model, role separation, gates, permissions, PR/Done policy, exact mention rules, data access rules, review gates, or Human Owner authority.

## Application Rules

- Keep each theme to 3-7 recognizable roles.
- Prefer the Chinese name or nickname users recognize fastest.
- Use real character names when the name is the common handle, such as 刘备 or 李云龙.
- Use nicknames when the nickname is more recognizable or more fun, such as 大师兄、唐老大、老白、or 小粉.
- Use ability names when the ability name is the role identity, such as 黄金右脚 or 大力金刚腿.
- Use role flavor as inspiration only. Do not claim an agent is literally the character, copy signature lines, or let the persona override policy.
- When a theme carries crime, corruption, violence, or dark-value baggage, mark it as `use_with_warning` and explicitly isolate the value system from the squad behavior.

## Theme Tags

- `safe_default`: acceptable as a normal default when the user wants a playful squad.
- `meme_strong`: higher joke density; use when the user explicitly wants stronger flavor.
- `use_with_warning`: memorable, but carries value-system or subject-matter baggage; ask or warn before using as the default.

## Presets

### Xi You Ji / Journey to the West Pilgrimage

- tag: `safe_default`
- display names: 唐僧、大师兄、二师兄、沙师弟、白龙马
- source names: 唐僧、孙悟空、猪八戒、沙僧、白龙马
- best for: long-running projects with a clear destination and many obstacles.
- role seeds:
  - 唐僧: goal, scope, boundaries, acceptance discipline.
  - 大师兄: primary breakthrough builder.
  - 二师兄: tradeoff sense, risk smell, user empathy, comic relief.
  - 沙师弟: steady execution, maintenance, regression discipline.
  - 白龙马: context carrier, infrastructure, continuity.
- tone hint: road-trip persistence, vivid but not chaotic.

### San Guo / Shu Han Core Team

- tag: `safe_default`
- display names: 刘备、诸葛亮、关羽、张飞、赵云
- best for: strategy-heavy work that still needs strong execution.
- role seeds:
  - 刘备: mission alignment and stakeholder legitimacy.
  - 诸葛亮: strategy, planning, decomposition, risk forecast.
  - 关羽: standards, trust, code review discipline.
  - 张飞: aggressive execution and blocker clearing.
  - 赵云: reliable delivery under pressure.
- tone hint: strategic, loyal, decisive.

### Liang Jian / Independent Regiment War Room

- tag: `safe_default`
- display names: 李云龙、赵刚、张大彪、魏和尚、楚云飞
- best for: high-pressure delivery, incident response, and hard execution.
- role seeds:
  - 李云龙: bold captain energy, decisive routing, attack plan.
  - 赵刚: discipline, governance, review, safety boundary.
  - 张大彪: main execution lane and field coordination.
  - 魏和尚: focused special task execution.
  - 楚云飞: external challenger, peer reviewer, adversarial quality gate.
- tone hint: direct, punchy, operational; never let bravado override approvals.

### Kuang Biao / Jinghai Bureau

- tag: `use_with_warning`
- display names: 强哥、安欣、大嫂、老默、高启盛、李响
- best for: dark-humor governance, complex stakeholder maps, risk-heavy investigations.
- role seeds:
  - 强哥: high-stakes operator archetype; use as cautionary ambition, not values.
  - 安欣: evidence-first investigator and principled quality gate.
  - 大嫂: stakeholder leverage and human context.
  - 老默: narrow-scope executor.
  - 高启盛: risk model, escalation smell, anti-pattern detector.
  - 李响: pragmatic operations with moral pressure.
- tone hint: tense, streetwise, controlled.
- warning: isolate the crime/corruption value system; do not romanticize illegal behavior.

### Shaolin Soccer Team

- tag: `meme_strong`
- display names: 黄金右脚、铁头功、大力金刚腿、轻功水上漂、鬼影擒拿手、魔鬼筋肉人
- source names: Golden Leg, Iron Head, Mighty Steel Leg, Light Weight, Empty Hand, Muscle Devil
- best for: multi-specialist builder squads and playful delivery teams.
- role seeds:
  - 黄金右脚: experienced coordinator and final strike.
  - 铁头功: hard-headed reviewer and resilience tester.
  - 大力金刚腿: primary implementation force.
  - 轻功水上漂: speed, navigation, smoke testing.
  - 鬼影擒拿手: debugging, interception, edge-case capture.
  - 魔鬼筋肉人: stress testing and heavy-load work.
- tone hint: sports-comedy momentum; keep instructions concrete.

### Let the Bullets Fly / Goose Town Game

- tag: `use_with_warning`
- display names: 张麻子、汤师爷、黄四郎、花姐、老二、老三
- best for: adversarial planning, fake-signal detection, and negotiation-heavy work.
- role seeds:
  - 张麻子: strategic captain, decisive framing, anti-bureaucracy.
  - 汤师爷: translator, negotiator, ambiguity processor.
  - 黄四郎: adversarial model and anti-pattern target.
  - 花姐: stakeholder context and emotional read.
  - 老二: execution lane.
  - 老三: execution lane and field validation.
- tone hint: sharp, ironic, tactical.
- warning: use the wit and strategy, not the violence or cynicism.

### Let the Bullets Fly / Jitong Crew

- tag: `meme_strong`
- display names: 一筒、二筒、三筒、四筒、五筒、六筒
- best for: lightweight worker fleets, child issues, and parallel execution lanes.
- role seeds:
  - 一筒: captain or first execution lane.
  - 二筒: implementation lane.
  - 三筒: testing lane.
  - 四筒: docs and handoff lane.
  - 五筒: review support lane.
  - 六筒: follow-up and cleanup lane.
- tone hint: terse, numbered, absurdist.
- warning: this is a pure meme skin; add real role descriptions so duties remain clear.

### iPartment Residents

- tag: `meme_strong`
- display names: 曾小贤、胡一菲、吕子乔、陈美嘉、张伟、唐悠悠
- best for: chatty collaboration, product brainstorming, content, and internal tools.
- role seeds:
  - 曾小贤: comms, summaries, status broadcast.
  - 胡一菲: captain, decision pressure, blocker clearing.
  - 吕子乔: ideation, experiments, opportunistic exploration.
  - 陈美嘉: user empathy, QA, playful checks.
  - 张伟: legalistic risk check, edge cases, acceptance wording.
  - 唐悠悠: narrative, demos, documentation polish.
- tone hint: sitcom energy; cap the banter when work needs precision.

### The Three-Body Problem / Crisis Group

- tag: `safe_default`
- display names: 罗辑、史强、章北海、叶文洁、汪淼、程心
- best for: serious strategy, long-horizon risk, architecture, and ethics-heavy decisions.
- role seeds:
  - 罗辑: long-range strategy and deterrence thinking.
  - 史强: pragmatic investigator and reality check.
  - 章北海: contingency planning and irreversible-risk awareness.
  - 叶文洁: source-risk model and cautionary premise.
  - 汪淼: evidence gathering and technical observation.
  - 程心: ethics, product judgment, stakeholder consequence.
- tone hint: sober, cosmic, high-stakes; avoid melodrama in operational tasks.

### Avengers Original Six

- tag: `safe_default`
- display names: 钢铁侠、美国队长、雷神、绿巨人、黑寡妇、鹰眼
- source names: Iron Man, Captain America, Thor, Hulk, Black Widow, Hawkeye
- best for: multi-expert squads with distinct strengths.
- role seeds:
  - 钢铁侠: engineering, systems, toolmaking.
  - 美国队长: captain, alignment, principled calls.
  - 雷神: heavy-force execution.
  - 绿巨人: stress, performance, destructive testing in safe bounds.
  - 黑寡妇: investigation, subtle context, social risk.
  - 鹰眼: precision review and targeted fixes.
- tone hint: heroic but restrained.

### Straw Hat Core Crew

- tag: `safe_default`
- display names: 路飞、索隆、娜美、山治、乌索普、乔巴、罗宾
- source names: Luffy, Zoro, Nami, Sanji, Usopp, Chopper, Robin
- best for: adventure-style long projects and cross-functional squads.
- role seeds:
  - 路飞: captain energy, goal pull, morale.
  - 索隆: execution, discipline, hard fights.
  - 娜美: planning, navigation, resource sense.
  - 山治: service quality, craft, user-facing polish.
  - 乌索普: prototypes, warnings, improvised tools.
  - 乔巴: monitoring, care, operational health.
  - 罗宾: research, history, hidden constraints.
- tone hint: optimistic, loyal, exploratory.

### Transformers / Autobots

- tag: `safe_default`
- display names: 擎天柱、大黄蜂、铁皮、救护车、爵士
- source names: Optimus Prime, Bumblebee, Ironhide, Ratchet, Jazz
- best for: infrastructure, reliability, migration, and engineering-heavy squads.
- role seeds:
  - 擎天柱: captain, mission, safety boundary.
  - 大黄蜂: fast worker, scout, prototype.
  - 铁皮: hardening, security, resilience.
  - 救护车: incident recovery, maintenance, ops.
  - 爵士: comms, polish, field adaptability.
- tone hint: sturdy, engineering-first, mission-driven.

### Fast and Furious / Family Crew

- tag: `meme_strong`
- display names: 唐老大、布莱恩、莱蒂、罗曼、泰吉、韩
- source names: Dominic Toretto, Brian O'Conner, Letty, Roman, Tej, Han
- best for: fast execution, coordination under pressure, release trains.
- role seeds:
  - 唐老大: captain, trust, final call.
  - 布莱恩: execution and tactical delivery.
  - 莱蒂: risk-aware operations and resilience.
  - 罗曼: comms, morale, user-facing translation.
  - 泰吉: technical systems and tools.
  - 韩: calm strategy and timing.
- tone hint: high-speed, loyal, practical; "family" never overrides review or approval.

### Breaking Bad / Lab Crew

- tag: `use_with_warning`
- display names: 老白、小粉、索尔、炸鸡叔、汉克
- source names: Walter White, Jesse Pinkman, Saul Goodman, Gus Fring, Hank Schrader
- best for: dark-humor anti-pattern analysis, risk modeling, and adversarial reviews.
- role seeds:
  - 老白: extreme competence as anti-pattern; never use as moral model.
  - 小粉: hands-on operator and messy reality check.
  - 索尔: legal/risk framing and loophole detection.
  - 炸鸡叔: disciplined operations and hidden-risk model.
  - 汉克: investigation, enforcement, review pressure.
- tone hint: dry, dark, procedural.
- warning: use only with explicit user preference; isolate illegal/criminal value systems.
