// A deterministic speaker pass over narrated Greek. Inside a narration the source prints no sigla:
// who speaks each paragraph is marked, when it is marked at all, by a reporting formula (ἔφην, ἦ δ’
// ὅς), a name after the formula (ὁ Γλαύκων) or a vocative (ὦ Κέβης). The pass owns a paragraph only
// on those marks and on strict alternation between two marked paragraphs of the same exchange, and
// sends everything else to review with its reason. It never guesses from content, so its errors are
// countable against accepted voice records (`scoreVoicePass`) before anything relies on it.
//
// It reads one level of narration. Where a report is itself retold, as in the Symposium and the
// Parmenides, first-person formulas belong to tellers at several levels, so those narrations are
// outside it.

export type Narration = {
  readonly dialogue: string;
  // Character ranges of the source that the narration covers, in order.
  readonly ranges: ReadonlyArray<readonly [number, number]>;
  // The teller whose first-person formulas (ἔφην, ἦν δ’ ἐγώ) mark their own speech.
  readonly narrator: string;
  // Each siglum the narration can name, with the capitalised forms the source uses for it.
  readonly cast: ReadonlyArray<{ readonly siglum: string; readonly forms: ReadonlyArray<string> }>;
};

export type VoicePrediction = {
  readonly start: number;
  readonly end: number;
  readonly owner?: string;
  readonly residue?: string;
  readonly grounds: ReadonlyArray<string>;
};

type Unit = {
  start: number;
  end: number;
  owner?: string;
  residue?: string;
  notOwner: Set<string>;
  addressed: string[];
  plural: boolean;
  grounds: string[];
  anchored: boolean;
  // A speaker the paragraph names even when it goes to review, such as the subject of a narrated
  // lead ("ὑπολαβὼν ὁ Κέβης ἔφη: …"), which still tells the next paragraphs who is in the exchange.
  naming?: string;
};

const L = "\\p{L}";
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
// A reporting formula counts only as a parenthetical inquit: punctuation on one side, or a named
// subject after it. "ἔφη γὰρ δὴ παραγενέσθαι" (Republic 614b) reports in accusative and infinitive.
const inquit = (formula: string) =>
  new RegExp(`(?:[,·;.:]\\s*(?:${formula})(?!${L})|(?<!${L})(?:${formula})\\s*(?:[,·;.:]|ὁ |ἡ |ἐγ[ώὼ]))`, "u");
const THIRD_FORMULA = "ἔφη|ἔφησεν|ἔφησε|ἦ δ’ [ὅὃ]ς|ἦ δ’ [ἥἣ]|εἶπεν|εἶπε";
const FIRST = inquit("ἦν δ’ ἐγ[ώὼ]|ἦν δὲ ἐγ[ώὼ]|ἔφην|εἶπον");
const THIRD = inquit(THIRD_FORMULA);
// The formula's own subject: a name within three words after it ("ἔφη ὁ Κέβης") or before it
// ("ὁ οὖν Γλαύκων, ἔφη"). A name further off is what the speech is about ("οὕτως ἄρα ὁ Σιμμίας
// ἐπωνυμίαν ἔχει", Phaedo 102c), not who speaks it.
const NEAR = "(?:[\\s,·]+[\\p{L}’]+){0,3}[\\s,·]+";
const subjectOf = (form: string) =>
  new RegExp(
    `(?<!${L})(?:${THIRD_FORMULA})${NEAR}(?:ὁ|ἡ)\\s(?:[\\p{L}’]+\\s)?${escape(form)}(?!${L})|(?<!${L})(?:ὁ|ἡ)\\s(?:[\\p{L}’]+\\s)?${escape(form)}${NEAR}(?:${THIRD_FORMULA})(?!${L})`,
    "u",
  );
// Plural address: second-plural pronouns, plural vocatives and second-plural verbs (συγχωρεῖτε
// Republic 540d, ἀποδώσετε 612c, κομίσασθε 507a).
const PLURAL = new RegExp(
  `(?<!${L})(?:ὑμεῖς|ὑμᾶς|ὑμῖν|ὑμῶν)(?!${L})|ὦ (?:μακάριοι|ἄνδρες|φίλοι|παῖδες)|${L}{2,}(?:ετε|έτε|ετέ|(?<!μ)ατε|(?<!μ)άτε|ατέ|εῖτε|οῦτε|ᾶτε|σθε|σθέ)(?!${L})`,
  "u",
);
// A narrated sentence ahead of the speech ("καὶ ἐγὼ ἀκούσας …", "καὶ ὃς ἐμβλέψας …") makes the
// paragraph part narration, part speech: a split, which the pass does not draw.
const NARRATED_LEAD =
  /^(?:(?:[\p{L}’]+ ){0,2}εἰπόντος |καὶ ἐγ[ώὼ] |καὶ ὃς |καὶ ὅς |καὶ ἣ |ὁ δὲ |ἡ δὲ |ὅ τε |ταῦτ’ εἰπόντος|ταῦτα εἰπόντος|ταῦτ’ οὖν ἐγ[ώὼ] |ἐγ[ώὼ] μὲν οὖν ταῦτα |καὶ ὁ )/u;
// Past this length an unmarked paragraph may continue the previous speaker's speech.
const LONG = 600;
const GREEK = /[Ͱ-Ͽἀ-῿]/u;

// Markers and editorial brackets are not speech. Quoted spans are staged speech or verse, whose
// formulas and vocatives must not decide the paragraph's speaker.
const clean = (text: string): string =>
  text
    .replace(/\{\/?(?:\d+[a-e]|b\d+|p|add|del|sic|pers|place)\}/gu, " ")
    .replace(/\{q\}[\s\S]*?\{\/q\}|\{quote\}[\s\S]*?\{\/quote\}/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();


// Paragraphs run from the first word after a paragraph mark or line break to the last character
// before the next; trailing markers belong to what follows, so records cover speech alone.
export const narrationUnits = (source: string, narration: Narration): Array<{ start: number; end: number }> => {
  const units: Array<{ start: number; end: number }> = [];
  for (const [from, to] of narration.ranges) {
    const breaks = [from];
    for (const match of source.slice(from, to).matchAll(/\{p\}|\n/gu)) breaks.push(from + (match.index ?? 0));
    breaks.push(to);
    for (let k = 0; k + 1 < breaks.length; k += 1) {
      let start = breaks[k]!;
      if (source.startsWith("{p}", start)) start += 3;
      let end = breaks[k + 1]!;
      while (start < end && /\s/u.test(source[start]!)) start += 1;
      for (;;) {
        while (end > start && /\s/u.test(source[end - 1]!)) end -= 1;
        const marker = /\{(?:\d+[a-e]|b\d+)\}$/u.exec(source.slice(start, end));
        if (!marker) break;
        end = start + marker.index;
      }
      if (end > start && GREEK.test(source.slice(start, end))) units.push({ start, end });
    }
  }
  return units;
};

const localUnit = (source: string, narration: Narration, span: { start: number; end: number }): Unit => {
  const text = clean(source.slice(span.start, span.end));
  const unit: Unit = {
    ...span,
    notOwner: new Set(),
    addressed: [],
    plural: PLURAL.test(text),
    grounds: [],
    anchored: false,
  };
  const first = FIRST.test(text);
  const third = THIRD.test(text);
  const named = third ? narration.cast.find(({ forms }) => forms.some((form) => subjectOf(form).test(text))) : undefined;
  for (const { siglum, forms } of narration.cast) {
    if (forms.some((form) => new RegExp(`ὦ(?: [\\p{L}’]+){0,2} ${escape(form)}(?!${L})`, "u").test(text))) unit.addressed.push(siglum);
  }
  for (const siglum of unit.addressed) unit.notOwner.add(siglum);
  // A named subject before the formula, with the speech after a colon, is narration leading into
  // speech: the speaker is known but the paragraph is a split.
  const intro = narration.cast.find(({ forms }) =>
    forms.some((form) => new RegExp(`(?:ὁ|ἡ) (?:[\\p{L}’]+ ){0,2}${escape(form)}(?: [\\p{L}’]+){0,3} (?:ἔφη|εἶπεν|εἶπε)\\s*:`, "u").test(text)),
  );
  if (named) unit.naming = named.siglum;
  if (intro) unit.naming = intro.siglum;
  if (text === "") unit.residue = "wholly quoted paragraph (staged exchange)";
  else if (intro || NARRATED_LEAD.test(text)) unit.residue = "narrated lead (split candidate)";
  else if (first && third) unit.residue = "first- and third-person formulas in one paragraph";
  else if (first) {
    unit.owner = narration.narrator;
    unit.grounds.push("first-person formula");
  } else if (named) {
    unit.owner = named.siglum;
    unit.grounds.push(`named formula ${named.siglum}`);
  } else if (third) {
    unit.notOwner.add(narration.narrator);
    unit.grounds.push("third-person formula");
  }
  if (unit.owner && unit.notOwner.has(unit.owner)) {
    unit.residue = "formula and vocative disagree";
    delete unit.owner;
  }
  unit.anchored = unit.owner !== undefined;
  if (unit.plural) unit.grounds.push("plural address");
  return unit;
};

// The two parties of the exchange in progress. A marked speaker who addresses someone opens an
// exchange with them; two marked speakers in a row are an exchange.
type Exchange = readonly [string, string];
const other = (exchange: Exchange | undefined, speaker: string) =>
  exchange === undefined ? undefined : exchange[0] === speaker ? exchange[1] : exchange[1] === speaker ? exchange[0] : undefined;

export function passNarration(source: string, narration: Narration): VoicePrediction[] {
  const units = narrationUnits(source, narration).map((span) => localUnit(source, narration, span));
  const exchanges: Array<Exchange | undefined> = [];
  let exchange: Exchange | undefined;
  let lastSpeaker: string | undefined;
  units.forEach((unit, index) => {
    // A vocative names only the listener. It names the speaker too when it answers the paragraph
    // before, whose marked speaker addressed someone by name: X, speaking to Y, is answered by Y
    // with "ὦ X". With three people present, the exchange in progress alone cannot say who answers.
    const previous = units[index - 1];
    const answered = previous?.anchored ? previous.addressed.find((siglum) => siglum !== previous.owner) : undefined;
    const asker = previous?.owner;
    if (!unit.owner && !unit.residue && unit.addressed.length === 1 && answered && asker && unit.addressed[0] === asker) {
      if (!unit.notOwner.has(answered)) {
        unit.owner = answered;
        unit.anchored = true;
        unit.grounds.push(`answers ${asker}, who addressed ${answered}`);
      }
    }
    // The exchange is the last marked speaker's, with whoever they address, or else with the last
    // other speaker marked before them: a new name replaces the partner, as when Glaucon takes
    // over from Adeimantus.
    const speaker = unit.owner ?? unit.naming;
    if (speaker) {
      const listener = unit.addressed.find((siglum) => siglum !== speaker);
      if (listener) exchange = [speaker, listener];
      else if (lastSpeaker && lastSpeaker !== speaker && other(exchange, speaker) === undefined) exchange = [lastSpeaker, speaker];
      lastSpeaker = speaker;
    }
    exchanges.push(exchange);
  });

  // Alternation between anchors: a run of unmarked paragraphs between two marked ones is owned
  // only when strict alternation inside one exchange reaches the next anchor and every paragraph's
  // own marks allow it.
  for (let i = 0; i < units.length; ) {
    if (units[i]!.anchored || units[i]!.residue) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < units.length && !units[j]!.anchored && !units[j]!.residue) j += 1;
    const before = i > 0 && units[i - 1]!.anchored ? units[i - 1] : undefined;
    const after = j < units.length && units[j]!.anchored ? units[j] : undefined;
    const run = units.slice(i, j);
    const assign = (from: string, ex: Exchange | undefined): string[] | undefined => {
      const partner = other(ex, from);
      if (!partner) return undefined;
      return run.map((_, k) => ((k + 1) % 2 === 1 ? partner : from));
    };
    let owners: string[] | undefined;
    const ground = "alternation between anchors";
    if (before) {
      owners = assign(before.owner!, exchanges[i - 1]);
      const reaches = owners && after ? (run.length % 2 === 1 ? before.owner : other(exchanges[i - 1], before.owner!)) === after.owner : true;
      if (owners && !reaches) owners = undefined;
      if (!owners) {
        const reason = other(exchanges[i - 1], before.owner!) ? "alternation conflicts with the next anchor" : "no exchange known at the previous anchor";
        for (const unit of run) unit.residue = reason;
      }
    } else {
      // Counting back from the next anchor was right in only 85% of the dev set's paragraphs.
      for (const unit of run) unit.residue = "no anchor before the run";
    }
    if (owners) {
      run.forEach((unit, k) => {
        const owner = owners![k]!;
        const previous = units[i + k - 1];
        if (previous && /\{\/(?:q|quote)\}\s*$/u.test(source.slice(previous.start, previous.end))) unit.residue = "follows a staged speech (may answer it)";
        else if (unit.end - unit.start > LONG) unit.residue = "long unmarked paragraph (a speech may continue)";
        else if (unit.notOwner.has(owner)) unit.residue = "alternation conflicts with the paragraph's own marks";
        else if (previous?.plural && !previous.residue) unit.residue = "reply to a plural address";
        else {
          unit.owner = owner;
          unit.grounds.push(ground);
        }
      });
    }
    i = j;
  }

  return units.map((unit) => ({
    start: unit.start,
    end: unit.end,
    grounds: unit.grounds,
    ...(unit.residue ? { residue: unit.residue } : unit.owner ? { owner: unit.owner } : { residue: "no mark and no alternation" }),
  }));
}

// Capitalised words of the source that spell a siglum's letters, without accents or breathings:
// Γλαύκων and Γλαύκωνα for ΓΛΑΥ., Σώκρατες for ΣΩ. A form that fits two sigla names neither.
export function castForms(source: string, sigla: ReadonlyArray<string>): Narration["cast"] {
  const bare = (word: string) => word.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
  const words = new Set(source.match(/(?<!\p{L})[Α-ΩἈ-Ὼ][\p{L}]+/gu) ?? []);
  const owners = new Map<string, string[]>();
  for (const word of words) {
    const letters = bare(word);
    const fits = sigla.filter((siglum) => letters.startsWith(siglum.replace(/\.$/u, "")));
    if (fits.length === 1) owners.set(word, fits);
  }
  return sigla.map((siglum) => ({
    siglum,
    forms: [...owners].filter(([, fits]) => fits[0] === siglum).map(([word]) => word)
      .sort(),
  }));
}

// The rule that decided a paragraph, without the sigla it named.
const ruleOf = (grounds: ReadonlyArray<string>): string => {
  const decisive = grounds.find((ground) => ground !== "plural address" && ground !== "third-person formula") ?? grounds[0] ?? "";
  return decisive.replace(/ [Α-Ω]+\.(?=,|$| who)/gu, "").replace(/, who addressed$/u, "");
};

export type AcceptedVoice = {
  readonly startChar: number;
  readonly endChar: number;
  readonly depth: number;
  readonly owner: string | undefined;
  readonly reviewed: boolean;
  // Records still awaiting review neither confirm nor contradict the pass; paragraphs they cover
  // are left unscored instead of being read as narration.
  readonly accepted: boolean;
};

export type VoicePassOutcome =
  | "agree"
  | "disagree"
  | "residue, accepted owned"
  | "residue, accepted unresolved"
  | "residue, accepted split"
  | "residue, accepted narration"
  | "owned, accepted unresolved"
  | "owned, accepted split"
  | "owned, accepted narration"
  | "unscored";

export type VoicePassScore = {
  readonly units: number;
  // Greek letters in paragraphs the pass owns, and how many of them the accepted records give to
  // the same speaker: the measure that matters for speaker shares, where a paragraph the accepted
  // records split into narration and speech is mostly, not wholly, right.
  readonly ownedLetters: number;
  readonly agreeingLetters: number;
  readonly outcomes: Readonly<Record<string, number>>;
  // The same outcomes for paragraphs whose accepted owner rests on a reviewed adjudication, the
  // judgment the pass would replace, rather than on a quotable formula.
  readonly reviewedOutcomes: Readonly<Record<string, number>>;
  // Agreement by the rule that owned the paragraph, so each rule's precision is known on its own.
  readonly byRule: Readonly<Record<string, { readonly agree: number; readonly disagree: number }>>;
  readonly disagreements: ReadonlyArray<{
    readonly start: number;
    readonly predicted: string;
    readonly accepted: string;
    readonly grounds: ReadonlyArray<string>;
  }>;
};

// The accepted owner of each paragraph: the voice at the scene's depth covering its Greek letters,
// "split" when the accepted records divide it, "narration" when no voice covers it.
export function scoreVoicePass(
  source: string,
  predictions: ReadonlyArray<VoicePrediction>,
  accepted: ReadonlyArray<AcceptedVoice>,
  sceneDepth: number,
): VoicePassScore {
  const voices = accepted.filter((voice) => voice.depth === sceneDepth).sort((a, b) => a.startChar - b.startChar);
  const outcomes: Record<string, number> = {};
  const reviewedOutcomes: Record<string, number> = {};
  const disagreements: Array<{ start: number; predicted: string; accepted: string; grounds: ReadonlyArray<string> }> = [];
  const byRule: Record<string, { agree: number; disagree: number }> = {};
  let ownedLetters = 0;
  let agreeingLetters = 0;
  let cursor = 0;
  for (const prediction of predictions) {
    while (cursor < voices.length && voices[cursor]!.endChar <= prediction.start) cursor += 1;
    const letters = new Map<string, number>();
    let reviewed = false;
    let greek = 0;
    for (let at = prediction.start; at < prediction.end; at += 1) {
      if (!GREEK.test(source[at]!)) continue;
      greek += 1;
      let owner = "narration";
      for (let k = cursor; k < voices.length && voices[k]!.startChar <= at; k += 1) {
        const voice = voices[k]!;
        if (at < voice.endChar) {
          owner = !voice.accepted ? "unscored" : (voice.owner ?? "unresolved");
          reviewed ||= voice.reviewed;
        }
      }
      letters.set(owner, (letters.get(owner) ?? 0) + 1);
    }
    if (prediction.owner && !letters.has("unscored")) {
      ownedLetters += greek;
      agreeingLetters += letters.get(prediction.owner) ?? 0;
    }
    const [top = "narration", count = 0] = [...letters].sort((a, b) => b[1] - a[1])[0] ?? [];
    const truth = count >= 0.9 * greek ? top : "split";
    let outcome: VoicePassOutcome;
    if (letters.has("unscored")) outcome = "unscored";
    else if (prediction.residue) {
      outcome = ["unresolved", "split", "narration"].includes(truth)
        ? (`residue, accepted ${truth}` as VoicePassOutcome)
        : "residue, accepted owned";
    } else if (["unresolved", "split", "narration"].includes(truth)) outcome = `owned, accepted ${truth}` as VoicePassOutcome;
    else if (prediction.owner === truth) outcome = "agree";
    else {
      outcome = "disagree";
      disagreements.push({ start: prediction.start, predicted: prediction.owner ?? "", accepted: truth, grounds: prediction.grounds });
    }
    outcomes[outcome] = (outcomes[outcome] ?? 0) + 1;
    if (outcome === "agree" || outcome === "disagree") {
      const rule = ruleOf(prediction.grounds);
      byRule[rule] ??= { agree: 0, disagree: 0 };
      byRule[rule][outcome] += 1;
    }
    if (reviewed) reviewedOutcomes[outcome] = (reviewedOutcomes[outcome] ?? 0) + 1;
  }
  return { units: predictions.length, ownedLetters, agreeingLetters, outcomes, reviewedOutcomes, byRule, disagreements };
}
