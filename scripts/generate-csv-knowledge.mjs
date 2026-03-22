import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const FILES = {
	fragrancesTs: path.join(ROOT, "src", "data", "fragrances.ts"),
	fraCleaned: path.join(ROOT, "src", "data", "csv", "fra_cleaned.csv"),
	fraPerfumes: path.join(ROOT, "src", "data", "csv", "fra_perfumes.csv"),
	perfumesDataset: path.join(ROOT, "src", "data", "csv", "perfumes_dataset.csv"),
	psycho: path.join(ROOT, "src", "data", "csv", "perfume_psycho.csv"),
	brain: path.join(ROOT, "src", "data", "csv", "perfume_brainfunc.csv"),
	compounds: path.join(ROOT, "src", "data", "csv", "perfume_compound.csv"),
	output: path.join(ROOT, "src", "data", "generated", "csvKnowledge.ts"),
	searchOutput: path.join(ROOT, "src", "data", "generated", "datasetSearchIndex.ts"),
};

function parseCSV(text, delimiter) {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const next = text[i + 1];

		if (ch === '"') {
			if (inQuotes && next === '"') {
				field += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}

		if (!inQuotes && ch === delimiter) {
			row.push(field);
			field = "";
			continue;
		}

		if (!inQuotes && (ch === "\n" || ch === "\r")) {
			if (ch === "\r" && next === "\n") i++;
			row.push(field);
			field = "";

			if (row.some((x) => x.trim().length > 0)) {
				rows.push(row);
			}

			row = [];
			continue;
		}

		field += ch;
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		if (row.some((x) => x.trim().length > 0)) {
			rows.push(row);
		}
	}

	return rows;
}

function toObjects(rows) {
	if (rows.length === 0) return [];
	const header = rows[0].map((h) => h.trim());

	return rows.slice(1).map((r) => {
		const obj = {};
		for (let i = 0; i < header.length; i++) {
			obj[header[i]] = (r[i] ?? "").trim();
		}
		return obj;
	});
}

function readCSV(filePath, delimiter) {
	const text = fs.readFileSync(filePath, "utf8");
	return toObjects(parseCSV(text, delimiter));
}

function normalize(input) {
	return (input || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function tokenize(input) {
	return normalize(input)
		.split(" ")
		.filter((x) => x.length > 1 && x !== "de" && x !== "di" && x !== "la" && x !== "le");
}

function parseNumber(input) {
	if (!input) return null;
	const clean = input.replace(/,/g, "").trim();
	if (!clean) return null;
	const num = Number(clean);
	return Number.isFinite(num) ? num : null;
}

function splitList(input) {
	if (!input) return [];
	return input
		.split(",")
		.map((x) => x.trim())
		.filter(Boolean);
}

function extractCatalogTargetsFromFragrancesTs(filePath) {
	const text = fs.readFileSync(filePath, "utf8");
	const regex = /id:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*brand:\s*"([^"]+)"/g;
	const targets = [];

	for (const match of text.matchAll(regex)) {
		targets.push({
			id: match[1],
			name: match[2],
			brand: match[3],
		});
	}

	return targets;
}

function scoreCatalogMatch(target, rowName, rowBrand) {
	const tNameTokens = tokenize(target.name);
	const rNameTokens = tokenize(rowName);
	const tBrand = normalize(target.brand);
	const rBrand = normalize(rowBrand);

	const nameOverlap = tNameTokens.filter((t) => rNameTokens.includes(t)).length;
	const brandExact = tBrand === rBrand ? 3 : 0;
	const brandContains = brandExact ? 0 : (rBrand.includes(tBrand) || tBrand.includes(rBrand) ? 1 : 0);

	const nameStrTarget = normalize(target.name).replace(/\s+/g, "");
	const nameStrRow = normalize(rowName).replace(/\s+/g, "");
	const fullNameMatch =
		nameStrTarget === nameStrRow ? 4 : (nameStrRow.includes(nameStrTarget) || nameStrTarget.includes(nameStrRow) ? 2 : 0);

	return nameOverlap * 2 + brandExact + brandContains + fullNameMatch;
}

function buildCatalogMap(cleanRows, perfumeRows, targets) {
	const unified = [];

	for (const row of cleanRows) {
		unified.push({
			source: "fra_cleaned",
			name: row["Perfume"],
			brand: row["Brand"],
			url: row["url"],
			ratingValue: parseNumber((row["Rating Value"] || "").replace(",", ".")),
			ratingCount: parseNumber(row["Rating Count"]),
			year: parseNumber(row["Year"]),
			mainAccords: [row["mainaccord1"], row["mainaccord2"], row["mainaccord3"], row["mainaccord4"], row["mainaccord5"]]
				.map((x) => (x || "").trim().toLowerCase())
				.filter(Boolean),
			top: splitList(row["Top"]),
			middle: splitList(row["Middle"]),
			base: splitList(row["Base"]),
			gender: (row["Gender"] || "").toLowerCase(),
		});
	}

	for (const row of perfumeRows) {
		unified.push({
			source: "fra_perfumes",
			name: row["Name"],
			brand: row["Name"]?.replace(/^.*?\b([A-Za-z-]+)for .*$/i, "$1") || "",
			url: row["url"],
			ratingValue: parseNumber(row["Rating Value"]),
			ratingCount: parseNumber(row["Rating Count"]),
			year: null,
			mainAccords: splitList((row["Main Accords"] || "").replace(/[\[\]']/g, "")).map((x) => x.toLowerCase()),
			top: [],
			middle: [],
			base: [],
			gender: (row["Gender"] || "").toLowerCase(),
		});
	}

	const mapped = {};

	for (const target of targets) {
		let best = null;
		let bestScore = -1;

		for (const row of unified) {
			const score = scoreCatalogMatch(target, row.name, row.brand);
			if (score > bestScore) {
				bestScore = score;
				best = row;
			}
		}

		if (best && bestScore >= 4) {
			mapped[target.id] = {
				name: best.name,
				brand: best.brand,
				sourceUrl: best.url || null,
				ratingValue: best.ratingValue,
				ratingCount: best.ratingCount,
				year: best.year,
				mainAccords: best.mainAccords.slice(0, 5),
				top: best.top.slice(0, 10),
				middle: best.middle.slice(0, 10),
				base: best.base.slice(0, 10),
				gender: best.gender || null,
				score: bestScore,
			};
		}
	}

	return mapped;
}

function buildMarketMap(rows, targets) {
	const mapped = {};

	for (const target of targets) {
		let best = null;
		let bestScore = -1;

		for (const row of rows) {
			const score = scoreCatalogMatch(target, row["perfume"], row["brand"]);
			if (score > bestScore) {
				best = row;
				bestScore = score;
			}
		}

		if (best && bestScore >= 4) {
			mapped[target.id] = {
				category: best["category"] || undefined,
				targetAudience: best["target_audience"] || undefined,
				marketLongevity: best["longevity"] || undefined,
			};
		}
	}

	return mapped;
}

function toSourceSearchUrl(brand, name) {
	const q = encodeURIComponent(`${brand} ${name} fragrance`);
	return `https://www.google.com/search?q=${q}`;
}

function pushIndexCandidate(bucket, source, payload) {
	const name = (payload.name || "").trim();
	const brand = (payload.brand || "").trim();
	if (!name || !brand) return;

	const key = `${normalize(brand)}|${normalize(name)}`;
	const ratingValue = payload.ratingValue ?? null;
	const ratingCount = payload.ratingCount ?? null;
	const popularity = (ratingValue || 0) * 10 + Math.min(Math.log10((ratingCount || 0) + 1) * 8, 20);

	bucket.push({
		key,
		source,
		brand,
		name,
		url: payload.url || toSourceSearchUrl(brand, name),
		ratingValue: ratingValue ?? undefined,
		ratingCount: ratingCount ?? undefined,
		mainAccords: payload.mainAccords || [],
		category: payload.category,
		targetAudience: payload.targetAudience,
		marketLongevity: payload.marketLongevity,
		gender: payload.gender,
		year: payload.year ?? undefined,
		popularity,
	});
}

function buildDatasetSearchIndex(cleanRows, perfumeRows, marketRows) {
	const candidates = [];

	for (const row of cleanRows) {
		pushIndexCandidate(candidates, "fra_cleaned", {
			brand: row["Brand"],
			name: row["Perfume"],
			url: row["url"],
			ratingValue: parseNumber((row["Rating Value"] || "").replace(",", ".")),
			ratingCount: parseNumber(row["Rating Count"]),
			mainAccords: [row["mainaccord1"], row["mainaccord2"], row["mainaccord3"], row["mainaccord4"], row["mainaccord5"]]
				.map((x) => (x || "").trim().toLowerCase())
				.filter(Boolean),
			gender: row["Gender"] || undefined,
			year: parseNumber(row["Year"]),
		});
	}

	for (const row of perfumeRows) {
		const inferredBrand = row["Name"]?.replace(/^.*?\b([A-Za-z-]+)for .*$/i, "$1") || "";
		pushIndexCandidate(candidates, "fra_perfumes", {
			brand: inferredBrand,
			name: row["Name"],
			url: row["url"],
			ratingValue: parseNumber(row["Rating Value"]),
			ratingCount: parseNumber(row["Rating Count"]),
			mainAccords: splitList((row["Main Accords"] || "").replace(/[\[\]']/g, "")).map((x) => x.toLowerCase()),
			gender: row["Gender"] || undefined,
		});
	}

	for (const row of marketRows) {
		pushIndexCandidate(candidates, "perfumes_dataset", {
			brand: row["brand"] || row["Brand"],
			name: row["perfume"] || row["Perfume"],
			category: row["category"] || row["Category"],
			targetAudience: row["target_audience"] || row["Target Audience"],
			marketLongevity: row["longevity"] || row["Longevity"],
		});
	}

	const dedup = new Map();
	for (const row of candidates) {
		const existing = dedup.get(row.key);
		if (!existing || row.popularity > existing.popularity) {
			dedup.set(row.key, row);
		}
	}

	const compact = [...dedup.values()]
		.sort((a, b) => b.popularity - a.popularity)
		.slice(0, 4500)
		.map((row) => ({
			source: row.source,
			brand: row.brand,
			name: row.name,
			url: row.url,
			ratingValue: row.ratingValue,
			ratingCount: row.ratingCount,
			mainAccords: row.mainAccords,
			category: row.category,
			targetAudience: row.targetAudience,
			marketLongevity: row.marketLongevity,
			gender: row.gender,
			year: row.year,
		}));

	return compact;
}

function buildCompoundLookup(rows) {
	const map = {};

	for (const row of rows) {
		const plant = row["Plants Name"];
		const components = splitList(row["Major Components"]);
		if (!plant || components.length === 0) continue;
		map[normalize(plant)] = components;
	}

	return map;
}

function splitMaterials(input) {
	if (!input) return [];
	return input
		.replace(/\([^)]*\)/g, " ")
		.replace(/[.;]/g, ",")
		.replace(/\band\b/gi, ",")
		.split(",")
		.map((x) => x.trim())
		.filter((x) => x.length >= 3)
		.slice(0, 25);
}

function buildEffectsMap(rows, effectField) {
	const map = {};

	for (const row of rows) {
		const mats = splitMaterials(row["Odorant Materials"]);
		const effect = row[effectField];
		if (!effect) continue;

		for (const mat of mats) {
			const key = normalize(mat);
			if (!key) continue;
			if (!map[key]) map[key] = new Set();
			map[key].add(effect.trim());
		}
	}

	return map;
}

function collectInsightsForTarget(target, compoundsMap, brainMap, psychoMap) {
	const noteTokens = tokenize(target.name);
	const insights = [];
	const compounds = new Set();

	const mergedEffects = new Map();
	const collectEffects = (srcMap, kind) => {
		for (const [k, vals] of Object.entries(srcMap)) {
			if (!noteTokens.some((t) => k.includes(t))) continue;
			for (const v of vals) {
				const key = `${kind}:${v}`;
				if (!mergedEffects.has(key)) mergedEffects.set(key, v);
			}
		}
	};

	collectEffects(brainMap, "brain");
	collectEffects(psychoMap, "psycho");

	for (const [k, vals] of Object.entries(compoundsMap)) {
		if (!noteTokens.some((t) => k.includes(t))) continue;
		for (const c of vals) compounds.add(c);
	}

	for (const val of mergedEffects.values()) {
		insights.push(val);
		if (insights.length >= 3) break;
	}

	return {
		researchInsights: insights,
		majorCompounds: [...compounds].slice(0, 6),
	};
}

function toTs(dataById, meta) {
	return `// Auto-generated by scripts/generate-csv-knowledge.mjs
// Do not edit manually.

export interface CsvEnrichment {
	sourceName: string;
	sourceBrand: string;
	sourceUrl?: string;
	ratingValue?: number;
	ratingCount?: number;
	sourceYear?: number;
	mainAccords: string[];
	sourceTopNotes: string[];
	sourceMiddleNotes: string[];
	sourceBaseNotes: string[];
	sourceGender?: string;
	marketCategory?: string;
	marketTargetAudience?: string;
	marketLongevity?: string;
	researchInsights: string[];
	majorCompounds: string[];
}

export const csvDatasetMeta = ${JSON.stringify(meta, null, 2)} as const;

export const csvEnrichmentById: Record<string, CsvEnrichment> = ${JSON.stringify(dataById, null, 2)};
`;
}

function toSearchTs(index, meta) {
	return `// Auto-generated by scripts/generate-csv-knowledge.mjs
// Do not edit manually.

export interface DatasetSearchEntry {
	source: "fra_cleaned" | "fra_perfumes" | "perfumes_dataset";
	brand: string;
	name: string;
	url: string;
	ratingValue?: number;
	ratingCount?: number;
	mainAccords: string[];
	category?: string;
	targetAudience?: string;
	marketLongevity?: string;
	gender?: string;
	year?: number;
}

export const datasetSearchMeta = ${JSON.stringify(meta, null, 2)} as const;

export const datasetSearchIndex: DatasetSearchEntry[] = ${JSON.stringify(index, null, 2)};
`;
}

function main() {
	const targets = extractCatalogTargetsFromFragrancesTs(FILES.fragrancesTs);
	const fraCleaned = readCSV(FILES.fraCleaned, ";");
	const fraPerfumes = readCSV(FILES.fraPerfumes, ",");
	const perfumesDataset = readCSV(FILES.perfumesDataset, ",");
	const psycho = readCSV(FILES.psycho, ",");
	const brain = readCSV(FILES.brain, ",");
	const compounds = readCSV(FILES.compounds, ",");

	const byId = buildCatalogMap(fraCleaned, fraPerfumes, targets);
	const marketById = buildMarketMap(perfumesDataset, targets);
	const searchIndex = buildDatasetSearchIndex(fraCleaned, fraPerfumes, perfumesDataset);
	const compoundsMap = buildCompoundLookup(compounds);
	const brainMap = buildEffectsMap(brain, "Brain Functions");
	const psychoMap = buildEffectsMap(psycho, "Psychophysiological Changes");

	const finalData = {};
	for (const target of targets) {
		const entry = byId[target.id];
		if (!entry) continue;

		const research = collectInsightsForTarget(target, compoundsMap, brainMap, psychoMap);
		const market = marketById[target.id];

		finalData[target.id] = {
			sourceName: entry.name,
			sourceBrand: entry.brand,
			sourceUrl: entry.sourceUrl || undefined,
			ratingValue: entry.ratingValue ?? undefined,
			ratingCount: entry.ratingCount ?? undefined,
			sourceYear: entry.year ?? undefined,
			mainAccords: entry.mainAccords,
			sourceTopNotes: entry.top,
			sourceMiddleNotes: entry.middle,
			sourceBaseNotes: entry.base,
			sourceGender: entry.gender || undefined,
			marketCategory: market?.category,
			marketTargetAudience: market?.targetAudience,
			marketLongevity: market?.marketLongevity,
			researchInsights: research.researchInsights,
			majorCompounds: research.majorCompounds,
		};
	}

	const meta = {
		generatedAt: new Date().toISOString(),
		sourceCounts: {
			fraCleaned: fraCleaned.length,
			fraPerfumes: fraPerfumes.length,
			perfumesDataset: perfumesDataset.length,
			brain: brain.length,
			psycho: psycho.length,
			compounds: compounds.length,
		},
		mappedFragrances: Object.keys(finalData).length,
		catalogTargetSize: targets.length,
	};

	const out = toTs(finalData, meta);
	fs.writeFileSync(FILES.output, out, "utf8");

	const searchMeta = {
		generatedAt: meta.generatedAt,
		indexSize: searchIndex.length,
		sourceCounts: meta.sourceCounts,
	};
	const searchOut = toSearchTs(searchIndex, searchMeta);
	fs.writeFileSync(FILES.searchOutput, searchOut, "utf8");

	console.log(`Generated ${FILES.output}`);
	console.log(`Generated ${FILES.searchOutput}`);
	console.log(`Mapped ${meta.mappedFragrances}/${meta.catalogTargetSize} catalog fragrances`);
}

main();
