export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  SUPERVISOR: "SUPERVISOR",
  CLEANER: "CLEANER",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Overall Viewer (Scrapify Ops)",
  SCHOOL_ADMIN: "School Admin",
  SUPERVISOR: "Supervisor",
  CLEANER: "Cleaner",
};

export const SHIFTS = [
  { id: 1, name: "MORNING", label: "Morning", start: "07:30", end: "11:00" },
  { id: 2, name: "AFTERNOON", label: "Afternoon", start: "11:00", end: "14:30" },
  { id: 3, name: "EVENING", label: "Evening", start: "14:30", end: "17:30" },
];

// Tamil Nadu districts only — 10 districts. Chennai has 12 schools; the rest have 2 each.
export const DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Tiruppur",
];

// [districtIndex, name, type, address]
const SCHOOL_SEED = [
  [0, "PSBB Senior Secondary School", "CO_ED", "K.K. Nagar"],
  [0, "Church Park Convent", "GIRLS_ONLY", "Chetpet"],
  [0, "Don Bosco Matriculation Higher Secondary School", "BOYS_ONLY", "Egmore"],
  [0, "Vidya Mandir Senior Secondary School", "CO_ED", "Mylapore"],
  [0, "Sishya School", "CO_ED", "Adyar"],
  [0, "DAV Boys Senior Secondary School", "BOYS_ONLY", "Gopalapuram"],
  [0, "Rosary Matriculation Higher Secondary School", "GIRLS_ONLY", "Santhome"],
  [0, "Chettinad Vidyashram", "CO_ED", "R.A. Puram"],
  [0, "Bala Vidya Mandir", "CO_ED", "Adyar"],
  [0, "St. Bede's Anglo Indian Higher Secondary School", "GIRLS_ONLY", "Santhome"],
  [0, "Good Shepherd Convent Higher Secondary School", "GIRLS_ONLY", "Nungambakkam"],
  [0, "Madras Christian College Higher Secondary School", "BOYS_ONLY", "Chetpet"],
  [1, "PSG Public School", "CO_ED", "Peelamedu"],
  [1, "Sri Ramakrishna Mission Vidyalaya", "BOYS_ONLY", "R.S. Puram"],
  [2, "TVS Academy", "CO_ED", "Tirupparankundram"],
  [2, "St. Mary's Higher Secondary School", "GIRLS_ONLY", "Bibikulam"],
  [3, "Campion Anglo Indian Higher Secondary School", "BOYS_ONLY", "Palakkarai"],
  [3, "Holy Cross Matriculation Higher Secondary School", "GIRLS_ONLY", "Puthur"],
  [4, "Vidhya Mandir Senior Secondary School", "CO_ED", "Suramangalam"],
  [4, "Sacred Heart Girls Higher Secondary School", "GIRLS_ONLY", "Hasthampatti"],
  [5, "St. Xavier's Higher Secondary School", "CO_ED", "Palayamkottai"],
  [5, "Sarah Tucker Matriculation Higher Secondary School", "GIRLS_ONLY", "Palayamkottai"],
  [6, "Sri Vidya Mandir Matriculation Higher Secondary School", "CO_ED", "Perundurai Road"],
  [6, "Nirmala Matriculation Higher Secondary School", "GIRLS_ONLY", "Erode"],
  [7, "William Bentinck Boys Higher Secondary School", "BOYS_ONLY", "Vellore"],
  [7, "Auxilium Convent Matriculation Higher Secondary School", "GIRLS_ONLY", "Vellore"],
  [8, "St. Joseph's Higher Secondary School", "BOYS_ONLY", "Thanjavur"],
  [8, "Poompuhar Matriculation Higher Secondary School", "GIRLS_ONLY", "Thanjavur"],
  [9, "Angel Matriculation Higher Secondary School", "CO_ED", "Tiruppur"],
  [9, "Sona Matriculation Higher Secondary School", "GIRLS_ONLY", "Tiruppur"],
];

export const schools = SCHOOL_SEED.map(([districtIdx, name, type, address], i) => ({
  id: i + 1,
  name,
  type,
  district: DISTRICTS[districtIdx],
  address,
}));

// Toilet blocks: co-ed schools get a boys + a girls block, single-gender schools get just their own.
export const toiletBlocks = [];
schools.forEach((s) => {
  if (s.type !== "GIRLS_ONLY") {
    toiletBlocks.push({ id: toiletBlocks.length + 1, schoolId: s.id, blockName: "Block A - Boys", gender: "BOYS", floor: "Ground Floor", seats: 6 });
  }
  if (s.type !== "BOYS_ONLY") {
    toiletBlocks.push({ id: toiletBlocks.length + 1, schoolId: s.id, blockName: s.type === "CO_ED" ? "Block B - Girls" : "Block A - Girls", gender: "GIRLS", floor: "Ground Floor", seats: 6 });
  }
});

const CLEANER_NAMES = [
  "Suresh Babu", "Lakshmi Devi", "Manoj Nair", "Kavya Reddy", "Arjun Das",
  "Priya Sundaram", "Divya Menon", "Karthik S", "Deepa V", "Muthu Kumar",
  "Geetha R", "Selvam K", "Anitha M", "Ravichandran P", "Kalaivani S",
  "Murugan P", "Vasanthi R", "Sekar N", "Pushpa Latha", "Dhanapal V",
];
const SUPERVISOR_NAMES = [
  "Ravi Kumar", "Meena Iyer", "Kiran Rao", "Farah Sheikh", "Ibrahim Khan",
  "Deepak Nair", "Anitha Krishnan", "Vikram Sundar", "Lakshmi Narayan", "Suresh Pillai",
];

export const users = [
  { id: 1, name: "Ananya Rao", role: ROLES.SUPER_ADMIN, schoolId: null, phone: "9000000001", email: "ananya.ops@scrapify.in" },
];

// School admins: id = school.id + 1 (ids 2..21)
schools.forEach((s) => {
  const shortName = s.name.split(" ").slice(0, 2).join(" ");
  users.push({ id: s.id + 1, name: `${shortName} Admin`, role: ROLES.SCHOOL_ADMIN, schoolId: s.id, phone: `90000${String(s.id + 1).padStart(5, "0")}` });
});

// One supervisor per district, covering every school in it (ids 22..31)
const supervisorBaseId = schools.length + 2;
DISTRICTS.forEach((d, i) => {
  const coversSchoolIds = schools.filter((s) => s.district === d).map((s) => s.id);
  users.push({
    id: supervisorBaseId + i,
    name: SUPERVISOR_NAMES[i],
    role: ROLES.SUPERVISOR,
    schoolId: null,
    coversSchoolIds,
    phone: `90000${String(supervisorBaseId + i).padStart(5, "0")}`,
  });
});

// One cleaner per school (ids 32..51)
const cleanerBaseId = supervisorBaseId + DISTRICTS.length;
schools.forEach((s, i) => {
  users.push({
    id: cleanerBaseId + i,
    name: CLEANER_NAMES[i % CLEANER_NAMES.length],
    role: ROLES.CLEANER,
    schoolId: s.id,
    phone: `90000${String(cleanerBaseId + i).padStart(5, "0")}`,
  });
});

const cleanerIdForSchool = (schoolId) => users.find((u) => u.role === ROLES.CLEANER && u.schoolId === schoolId)?.id;
toiletBlocks.forEach((b) => { b.assignedCleanerId = cleanerIdForSchool(b.schoolId); });

// ~2 months of history (today going back), so "This Month" and custom ranges have real coverage.
const today = new Date();
const dayKey = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};
const HISTORY_DAYS = 62;
export const recentDays = Array.from({ length: HISTORY_DAYS }, (_, i) => dayKey(HISTORY_DAYS - 1 - i));
export const todayDate = recentDays[recentDays.length - 1];
export const earliestDate = recentDays[0];

// 4 districts are deliberately made poor performers (well under 50% compliance) so the
// top/poor-performing split has real contrast instead of everything sitting in the 80-95% band.
const POOR_DISTRICTS = new Set(["Tiruchirappalli", "Vellore", "Thanjavur", "Tirunelveli"]);
// Even inside otherwise-good districts, a handful of individual schools are poor performers —
// a district isn't uniformly good or bad in reality, and the school-level drill-down should show it.
const POOR_SCHOOL_NAMES = new Set([
  "Good Shepherd Convent Higher Secondary School",
  "Madras Christian College Higher Secondary School",
  "Sri Ramakrishna Mission Vidyalaya",
  "St. Mary's Higher Secondary School",
  "Sacred Heart Girls Higher Secondary School",
  "Nirmala Matriculation Higher Secondary School",
  "Sona Matriculation Higher Secondary School",
]);
const poorSchoolIds = new Set(
  schools.filter((s) => POOR_DISTRICTS.has(s.district) || POOR_SCHOOL_NAMES.has(s.name)).map((s) => s.id)
);

function isMissed(block, shift, dayIdx) {
  const isPoor = poorSchoolIds.has(block.schoolId);
  // Poor districts: ~75% missed, so compliance sits well under 50% even for a single day's
  // small sample size. Others: ~9% missed (~90%+), comfortably above 50%.
  return isPoor ? (block.id + shift.id + dayIdx) % 4 !== 0 : (block.id + shift.id + dayIdx) % 11 === 0;
}

export const cleaningLogs = [];
toiletBlocks.forEach((block) => {
  SHIFTS.forEach((shift) => {
    recentDays.forEach((date, dayIdx) => {
      const isToday = dayIdx === recentDays.length - 1;
      const isTodayEvening = isToday && shift.name === "EVENING";
      // Today's evening shift is only partially through its window — about a third of blocks
      // genuinely haven't been cleaned yet (PENDING); the rest already have a real DONE/MISSED result.
      const stillPending = isTodayEvening && (block.id + dayIdx) % 3 === 0;
      const status = stillPending ? "PENDING" : isMissed(block, shift, dayIdx) ? "MISSED" : "DONE";
      cleaningLogs.push({
        id: `${block.id}-${shift.id}-${date}`,
        toiletBlockId: block.id,
        shiftId: shift.id,
        date,
        status,
        cleanedByUserId: status === "DONE" ? block.assignedCleanerId : null,
      });
    });
  });
});

export const DATE_RANGES = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  WEEK: "This Week",
  MONTH: "This Month",
  CUSTOM: "Custom range",
};

export function getDatesForRange(rangeKey, customFrom, customTo) {
  const n = recentDays.length;
  if (rangeKey === "YESTERDAY") return recentDays.slice(n - 2, n - 1);
  if (rangeKey === "WEEK") return recentDays.slice(n - 7);
  if (rangeKey === "MONTH") return recentDays.slice(n - 30);
  if (rangeKey === "CUSTOM" && customFrom && customTo) {
    return recentDays.filter((d) => d >= customFrom && d <= customTo);
  }
  return recentDays.slice(n - 1); // TODAY
}

export const getSchoolById = (id) => schools.find((s) => s.id === id);
export const getBlocksBySchool = (schoolId) => toiletBlocks.filter((b) => b.schoolId === schoolId);
export const getBlocksForCleaner = (userId) => toiletBlocks.filter((b) => b.assignedCleanerId === userId);
export const getUserById = (id) => users.find((u) => u.id === id);

export const schoolIdsForUser = (user) => {
  if (!user) return [];
  if (user.role === ROLES.SUPER_ADMIN) return schools.map((s) => s.id);
  if (user.role === ROLES.SUPERVISOR) return user.coversSchoolIds || [];
  return user.schoolId ? [user.schoolId] : [];
};

export const districtsInScope = (schoolIds) => {
  const scoped = schools.filter((s) => schoolIds.includes(s.id));
  return DISTRICTS.filter((d) => scoped.some((s) => s.district === d));
};

function pct(logs) {
  const due = logs.filter((l) => l.status !== "PENDING");
  return due.length ? Math.round((due.filter((l) => l.status === "DONE").length / due.length) * 100) : null;
}

export function complianceByShift(schoolIds, dates) {
  const blockIds = toiletBlocks.filter((b) => schoolIds.includes(b.schoolId)).map((b) => b.id);
  return SHIFTS.map((shift) => {
    const boysLogs = cleaningLogs.filter((l) => dates.includes(l.date) && l.shiftId === shift.id && blockIds.includes(l.toiletBlockId) &&
      toiletBlocks.find((b) => b.id === l.toiletBlockId)?.gender === "BOYS");
    const girlsLogs = cleaningLogs.filter((l) => dates.includes(l.date) && l.shiftId === shift.id && blockIds.includes(l.toiletBlockId) &&
      toiletBlocks.find((b) => b.id === l.toiletBlockId)?.gender === "GIRLS");
    return { shift: shift.label, boys: pct(boysLogs), girls: pct(girlsLogs) };
  });
}

// scheduled = due shifts (excludes not-yet-due PENDING today); completed = of those, how many DONE.
function complianceDetail(blockIds, dates) {
  const logs = cleaningLogs.filter((l) => dates.includes(l.date) && blockIds.includes(l.toiletBlockId) && l.status !== "PENDING");
  const completed = logs.filter((l) => l.status === "DONE").length;
  const scheduled = logs.length;
  return { scheduled, completed, compliance: scheduled ? Math.round((completed / scheduled) * 100) : 0 };
}

export function overallCompliance(schoolIds, dates) {
  const blockIds = toiletBlocks.filter((b) => schoolIds.includes(b.schoolId)).map((b) => b.id);
  return complianceDetail(blockIds, dates).compliance;
}

// Per-gender shift breakdown: how many logs completed morning/afternoon/evening,
// and how many are incomplete (missed, or — for today only — not yet due).
export function genderShiftStatus(schoolIds, dates) {
  const blockIds = toiletBlocks.filter((b) => schoolIds.includes(b.schoolId)).map((b) => b.id);
  return ["BOYS", "GIRLS"].map((gender) => {
    const gBlockIds = toiletBlocks.filter((b) => blockIds.includes(b.id) && b.gender === gender).map((b) => b.id);
    const logs = cleaningLogs.filter((l) => dates.includes(l.date) && gBlockIds.includes(l.toiletBlockId));
    const doneInShift = (shiftId) => logs.filter((l) => l.shiftId === shiftId && l.status === "DONE").length;
    return {
      gender,
      Morning: doneInShift(1),
      Afternoon: doneInShift(2),
      Evening: doneInShift(3),
      Incomplete: logs.filter((l) => l.status !== "DONE").length,
    };
  });
}

export function rankSchools(schoolIds, dates) {
  return schools
    .filter((s) => schoolIds.includes(s.id))
    .map((s) => {
      const blockIds = toiletBlocks.filter((b) => b.schoolId === s.id).map((b) => b.id);
      return { id: s.id, name: s.name, district: s.district, ...complianceDetail(blockIds, dates) };
    })
    .sort((a, b) => b.compliance - a.compliance);
}

export function rankDistricts(schoolIds, dates) {
  return districtsInScope(schoolIds)
    .map((district) => {
      const ids = schools.filter((s) => schoolIds.includes(s.id) && s.district === district).map((s) => s.id);
      const blockIds = toiletBlocks.filter((b) => ids.includes(b.schoolId)).map((b) => b.id);
      return { district, name: district, schoolCount: ids.length, ...complianceDetail(blockIds, dates) };
    })
    .sort((a, b) => b.compliance - a.compliance);
}

export function rankToiletBlocks(schoolId, dates) {
  return toiletBlocks
    .filter((b) => b.schoolId === schoolId)
    .map((b) => ({ id: b.id, name: b.blockName, gender: b.gender, ...complianceDetail([b.id], dates) }))
    .sort((a, b) => b.compliance - a.compliance);
}

export function totalWorkers(schoolIds) {
  return users.filter((u) => u.role === ROLES.CLEANER && schoolIds.includes(u.schoolId)).length;
}

export function toiletTotals(schoolIds) {
  const blocks = toiletBlocks.filter((b) => schoolIds.includes(b.schoolId));
  return {
    total: blocks.length,
    boys: blocks.filter((b) => b.gender === "BOYS").length,
    girls: blocks.filter((b) => b.gender === "GIRLS").length,
  };
}
