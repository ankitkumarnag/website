/*
  =========================================================
  NAGARSWAR AI
  DUPLICATE COMPLAINT DETECTOR
  =========================================================

  Current Step 2 is a deterministic similarity engine.

  It checks:
  1. Same complaint category
  2. GPS distance between complaints
  3. Similarity of title + description text

  Important:
  - It does NOT automatically reject a complaint.
  - It only flags a possible duplicate and links complaints.
  - Resolved/closed complaints are ignored so a new recurrence
    is not automatically treated as a duplicate of an old issue.
*/

const DEFAULT_MAX_DISTANCE_METERS = 500;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "near",
  "of",
  "on",
  "or",
  "that",
  "the",
  "there",
  "this",
  "to",
  "was",
  "were",
  "with",
  "issue",
  "problem",
  "please",
]);

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return new Set();
  }

  return new Set(
    normalized
      .split(" ")
      .filter(
        (word) =>
          word.length >= 3 &&
          !STOP_WORDS.has(word)
      )
  );
}

function jaccardSimilarity(
  firstText,
  secondText
) {
  const firstTokens =
    tokenize(firstText);

  const secondTokens =
    tokenize(secondText);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  const union =
    new Set([
      ...firstTokens,
      ...secondTokens,
    ]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

function toCoordinate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numeric =
    Number(value);

  return Number.isFinite(numeric)
    ? numeric
    : null;
}

function degreesToRadians(value) {
  return (
    value *
    Math.PI
  ) / 180;
}

function calculateDistanceMeters(
  firstLat,
  firstLng,
  secondLat,
  secondLng
) {
  const lat1 =
    toCoordinate(firstLat);

  const lng1 =
    toCoordinate(firstLng);

  const lat2 =
    toCoordinate(secondLat);

  const lng2 =
    toCoordinate(secondLng);

  if (
    lat1 === null ||
    lng1 === null ||
    lat2 === null ||
    lng2 === null
  ) {
    return null;
  }

  const earthRadiusMeters =
    6371000;

  const deltaLat =
    degreesToRadians(
      lat2 - lat1
    );

  const deltaLng =
    degreesToRadians(
      lng2 - lng1
    );

  const radLat1 =
    degreesToRadians(lat1);

  const radLat2 =
    degreesToRadians(lat2);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(deltaLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusMeters * c;
}

function getGeoScore(distanceMeters) {
  if (distanceMeters === null) {
    return null;
  }

  if (distanceMeters <= 50) {
    return 100;
  }

  if (distanceMeters <= 100) {
    return 90;
  }

  if (distanceMeters <= 250) {
    return 75;
  }

  if (distanceMeters <= 500) {
    return 55;
  }

  if (distanceMeters <= 1000) {
    return 25;
  }

  return 0;
}

function isResolvedComplaint(complaint) {
  const status =
    String(
      complaint?.status || ""
    )
      .trim()
      .toLowerCase();

  return (
    status.includes("resolved") ||
    status.includes("closed") ||
    status.includes("completed")
  );
}

function buildComplaintText(complaint) {
  return [
    complaint?.title,
    complaint?.description,
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreCandidate(
  newComplaint,
  existingComplaint
) {
  const newCategory =
    normalizeCategory(
      newComplaint.category
    );

  const existingCategory =
    normalizeCategory(
      existingComplaint.category
    );

  const categoryMatched =
    Boolean(newCategory) &&
    newCategory ===
      existingCategory;

  if (!categoryMatched) {
    return null;
  }

  const newText =
    buildComplaintText(
      newComplaint
    );

  const existingText =
    buildComplaintText(
      existingComplaint
    );

  const combinedSimilarity =
    jaccardSimilarity(
      newText,
      existingText
    );

  const titleSimilarity =
    jaccardSimilarity(
      newComplaint.title,
      existingComplaint.title
    );

  const textSimilarity =
    Math.max(
      combinedSimilarity,
      titleSimilarity
    );

  const distanceMeters =
    calculateDistanceMeters(
      newComplaint.latitude,
      newComplaint.longitude,
      existingComplaint.latitude,
      existingComplaint.longitude
    );

  const geoScore =
    getGeoScore(
      distanceMeters
    );

  let score;

  if (geoScore !== null) {
    /*
      Category = 35%
      GPS proximity = 35%
      Text similarity = 30%
    */

    score =
      35 +
      geoScore * 0.35 +
      textSimilarity * 30;
  } else {
    /*
      If GPS is unavailable:
      Category = 40%
      Text similarity = 60%

      This path requires stronger text similarity
      before a duplicate is flagged.
    */

    score =
      40 +
      textSimilarity * 60;
  }

  score =
    Math.round(
      Math.min(
        100,
        Math.max(
          0,
          score
        )
      )
    );

  const textPercent =
    Math.round(
      textSimilarity *
        100
    );

  const reasons = [
    "Same complaint category",
  ];

  if (
    distanceMeters !== null
  ) {
    reasons.push(
      `Approximately ${Math.round(
        distanceMeters
      )} m from an existing complaint`
    );
  } else {
    reasons.push(
      "GPS comparison unavailable"
    );
  }

  reasons.push(
    `Text similarity ${textPercent}%`
  );

  /*
    Duplicate decision rules:

    With GPS:
    - must be within 500 m
    - score >= 70
    - text similarity >= 15%

    Without GPS:
    - score >= 78
    - text similarity >= 63%

    This intentionally avoids treating every complaint in
    the same category as a duplicate.
  */

  let isPossibleDuplicate =
    false;

  if (
    distanceMeters !== null
  ) {
    isPossibleDuplicate =
      distanceMeters <=
        DEFAULT_MAX_DISTANCE_METERS &&
      score >= 70 &&
      textSimilarity >= 0.15;
  } else {
    isPossibleDuplicate =
      score >= 78 &&
      textSimilarity >= 0.63;
  }

  return {
    complaintId:
      existingComplaint.id,
    score,
    textSimilarity:
      textPercent,
    distanceMeters:
      distanceMeters === null
        ? null
        : Math.round(
            distanceMeters
          ),
    categoryMatched,
    isPossibleDuplicate,
    reasons,
  };
}

function analyzeDuplicateComplaint({
  newComplaint,
  existingComplaints,
}) {
  const candidates = [];

  for (
    const complaint of
    existingComplaints || []
  ) {
    if (
      !complaint ||
      !complaint.id ||
      isResolvedComplaint(
        complaint
      )
    ) {
      continue;
    }

    const candidate =
      scoreCandidate(
        newComplaint,
        complaint
      );

    if (candidate) {
      candidates.push(
        candidate
      );
    }
  }

  candidates.sort(
    (first, second) => {
      if (
        second.isPossibleDuplicate !==
        first.isPossibleDuplicate
      ) {
        return Number(
          second.isPossibleDuplicate
        ) -
          Number(
            first.isPossibleDuplicate
          );
      }

      return (
        second.score -
        first.score
      );
    }
  );

  const bestMatch =
    candidates[0] ||
    null;

  const duplicateMatches =
    candidates.filter(
      (candidate) =>
        candidate.isPossibleDuplicate
    );

  const isPossibleDuplicate =
    duplicateMatches.length >
    0;

  const selectedMatch =
    isPossibleDuplicate
      ? duplicateMatches[0]
      : bestMatch;

  return {
    isPossibleDuplicate,

    status:
      isPossibleDuplicate
        ? "Possible Duplicate"
        : candidates.length > 0
        ? "No Strong Duplicate Match"
        : "No Duplicate Found",

    score:
      selectedMatch?.score ??
      0,

    matchedComplaintId:
      isPossibleDuplicate
        ? selectedMatch.complaintId
        : null,

    matchedComplaintIds:
      duplicateMatches
        .slice(0, 3)
        .map(
          (candidate) =>
            candidate.complaintId
        ),

    distanceMeters:
      selectedMatch?.distanceMeters ??
      null,

    textSimilarity:
      selectedMatch?.textSimilarity ??
      0,

    categoryMatched:
      selectedMatch?.categoryMatched ??
      false,

    reasons:
      selectedMatch?.reasons ??
      [
        "No comparable open complaint found",
      ],

    detectionType:
      "Rule-based similarity: category + GPS distance + text similarity",
  };
}

module.exports = {
  analyzeDuplicateComplaint,
  calculateDistanceMeters,
  jaccardSimilarity,
};
