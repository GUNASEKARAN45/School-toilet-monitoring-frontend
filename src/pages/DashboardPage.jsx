import { useEffect, useMemo, useState } from "react";
import { Box, Card, Grid, Typography, MenuItem, Select, FormControl, InputLabel, Stack, TextField, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, School, Groups, Wc, TrendingUp } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  schools, schoolIdsForUser, districtsInScope,
  complianceByShift, overallCompliance, genderShiftStatus, todayShiftSummaryByGender,
  rankSchools, rankDistricts, rankToiletBlocks, totalWorkers, toiletTotals,
  DATE_RANGES, getDatesForRange, earliestDate, todayDate, recentDays,
} from "../data/dummyData";
import { brand, SHIFT_COLORS } from "../theme";
import StatBar from "../components/StatBar";

function truncateLabel(str, n = 14) {
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

function AxisTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={12} textAnchor="middle" fontSize={10.5} fill="#52514e">
      {truncateLabel(payload.value)}
    </text>
  );
}

function textColorFor(bgHex) {
  const c = bgHex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2937" : "#ffffff";
}

function PieSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }) {
  if (!percent) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = textColorFor(fill);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central">
      <tspan x={x} dy="-0.3em" fontSize={16} fontWeight={700} fill={color}>{Math.round(percent * 100)}%</tspan>
      <tspan x={x} dy="1.3em" fontSize={11} fill={color}>{name}</tspan>
    </text>
  );
}

function PieLegend({ data, total }) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", justifyContent: "center", gap: 1, mt: 0.5 }}>
      {data.map((d) => {
        const color = SHIFT_COLORS[d.name] || SHIFT_COLORS.Pending;
        return (
          <Stack
            key={d.name}
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", bgcolor: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: 5, px: 1.1, py: 0.5 }}
          >
            <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color, flex: "none" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{d.name}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {d.value} / {total}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

function PageControls({ page, totalPages, onPrev, onNext }) {
  return (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: "center", flex: "none" }}>
      <IconButton size="small" onClick={onPrev} disabled={page === 0}>
        <ChevronLeft fontSize="small" />
      </IconButton>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, minWidth: 36, textAlign: "center" }}>
        {page + 1} / {totalPages}
      </Typography>
      <IconButton size="small" onClick={onNext} disabled={page === totalPages - 1}>
        <ChevronRight fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function severityColor(pctValue) {
  if (pctValue >= 90) return brand.good;
  if (pctValue >= 75) return brand.warning;
  return brand.critical;
}

// Small ring drawn with a conic-gradient — no charting library needed for a stat this size.
function CircularStat({ pctValue, size = 60, thickness = 6, color }) {
  const notDueYet = pctValue === null;
  const ringColor = color || (notDueYet ? brand.muted : severityColor(pctValue));

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flex: "none",
        background: notDueYet ? "#EEF0F2" : `conic-gradient(${ringColor} ${pctValue * 3.6}deg, #EEF0F2 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: size - thickness,
          height: size - thickness,
          borderRadius: "50%",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: size >= 56 ? "0.95rem" : "0.62rem", color: notDueYet ? "text.disabled" : "text.primary" }}>
          {notDueYet ? "—" : `${pctValue}%`}
        </Typography>
      </Box>
    </Box>
  );
}

function shiftPct(shift) {
  return shift.total === 0 ? null : Math.round((shift.completed / shift.total) * 100);
}

function ShiftCompletionRow({ shift }) {
  const { label, total, completed } = shift;
  const pctValue = shiftPct(shift);
  const notDueYet = pctValue === null;
  const color = notDueYet ? brand.muted : severityColor(pctValue);

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: SHIFT_COLORS[label] || SHIFT_COLORS.Pending, flex: "none" }} />
      <Typography variant="body2" sx={{ fontWeight: 700, width: 76, flex: "none" }}>{label}</Typography>
      <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: "#EEF0F2", overflow: "hidden" }}>
        {!notDueYet && (
          <Box sx={{ width: `${pctValue}%`, height: "100%", borderRadius: 4, bgcolor: color, transition: "width 0.3s" }} />
        )}
      </Box>
      <Typography variant="caption" sx={{ width: 110, flex: "none", textAlign: "right", color: notDueYet ? "text.disabled" : "text.secondary", fontWeight: 600 }}>
        {notDueYet ? "Not due yet" : `${completed} of ${total} done`}
      </Typography>
    </Stack>
  );
}

function overallOf(shifts) {
  const total = shifts.reduce((sum, s) => sum + s.total, 0);
  const completed = shifts.reduce((sum, s) => sum + s.completed, 0);
  return { total, completed, pctValue: total === 0 ? null : Math.round((completed / total) * 100) };
}

function GenderCompletionColumn({ label, shifts, icon, tint, tintBorder, accent }) {
  const overall = overallOf(shifts);
  return (
    <Box sx={{ flex: 1, minWidth: 0, bgcolor: tint, border: `1px solid ${tintBorder}`, borderRadius: 3, p: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <CircularStat pctValue={overall.pctValue} size={60} thickness={6} />
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "7px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: `${accent}22`, color: accent }}>
              {icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{label}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary", pl: "34px" }}>
            {overall.total === 0 ? "Not due yet" : `${overall.completed} of ${overall.total} completed`}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={1.5}>
        {shifts.map((shift) => (
          <ShiftCompletionRow key={shift.id} shift={shift} />
        ))}
      </Stack>
    </Box>
  );
}

function RankingTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 1.5, p: 1, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.3 }}>{d.name}</Typography>
      <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>Scheduled: {d.scheduled}</Typography>
      <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>Completed: {d.completed}</Typography>
      <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>Compliance: {d.compliance}%</Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const baseSchoolIds = schoolIdsForUser(currentUser);
  const baseSchools = schools.filter((s) => baseSchoolIds.includes(s.id));
  const baseDistricts = districtsInScope(baseSchoolIds);
  const showLocationFilters = baseSchoolIds.length > 1;

  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [rangeKey, setRangeKey] = useState("TODAY");
  const [customFrom, setCustomFrom] = useState(recentDays[recentDays.length - 7]);
  const [customTo, setCustomTo] = useState(todayDate);

  const dates = useMemo(() => getDatesForRange(rangeKey, customFrom, customTo), [rangeKey, customFrom, customTo]);
  const incompleteLabel = rangeKey === "TODAY" ? "Pending" : "Missed";

  const schoolsAfterDistrict = districtFilter === "ALL" ? baseSchools : baseSchools.filter((s) => s.district === districtFilter);

  const scopedSchoolIds = useMemo(() => {
    if (schoolFilter !== "ALL") return [Number(schoolFilter)];
    return schoolsAfterDistrict.map((s) => s.id);
  }, [schoolFilter, schoolsAfterDistrict]);

  const scopedSchools = schools.filter((s) => scopedSchoolIds.includes(s.id));
  const scopedDistricts = districtsInScope(scopedSchoolIds);
  const workers = totalWorkers(scopedSchoolIds);
  const toilets = toiletTotals(scopedSchoolIds);
  const complianceValue = overallCompliance(scopedSchoolIds, dates);
  const shiftData = complianceByShift(scopedSchoolIds, dates);
  const genderPies = genderShiftStatus(scopedSchoolIds, dates);
  const todayGenderSummary = todayShiftSummaryByGender(scopedSchoolIds);

  const ranking = useMemo(() => {
    if (scopedSchools.length === 1) {
      const school = scopedSchools[0];
      return { level: "toilet", unitLabel: "Toilet Blocks", title: `Toilet block performance — ${school.name}`, data: rankToiletBlocks(school.id, dates) };
    }
    if (scopedDistricts.length === 1) {
      return { level: "school", unitLabel: "Schools", title: `School performance — ${scopedDistricts[0]}`, data: rankSchools(scopedSchoolIds, dates) };
    }
    return { level: "district", unitLabel: "Districts", title: "District performance", data: rankDistricts(scopedSchoolIds, dates) };
  }, [scopedSchools, scopedDistricts, scopedSchoolIds, dates]);

  // Only relevant when the primary ranking above is showing districts — otherwise (a single
  // district or single school in scope) the primary chart already covers school-level detail.
  const schoolRanking = useMemo(() => rankSchools(scopedSchoolIds, dates), [scopedSchoolIds, dates]);

  // Poor performing = genuinely below 50% compliance, not just "the bottom half" — so the two
  // charts reflect an actual quality bar rather than an arbitrary split.
  const n = ranking.data.length;
  const topList = ranking.data.filter((d) => d.compliance >= 50);
  const poorList = ranking.data.filter((d) => d.compliance < 50);
  const schoolTopList = schoolRanking.filter((d) => d.compliance >= 50);
  const schoolPoorList = schoolRanking.filter((d) => d.compliance < 50);

  const PAGE_SIZE = 10;
  const [topPage, setTopPage] = useState(0);
  const [poorPage, setPoorPage] = useState(0);
  const [schoolTopPage, setSchoolTopPage] = useState(0);
  const [schoolPoorPage, setSchoolPoorPage] = useState(0);
  // Filters/date range can shrink any of these lists out from under the current page — snap back
  // to page 1 rather than showing an empty chart. Keyed off the filter inputs themselves (not
  // `ranking`, which is a new object on every render) so it doesn't fire on unrelated re-renders.
  useEffect(() => {
    setTopPage(0);
    setPoorPage(0);
    setSchoolTopPage(0);
    setSchoolPoorPage(0);
  }, [districtFilter, schoolFilter, rangeKey, customFrom, customTo]);

  const paginate = (data, page) => {
    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * PAGE_SIZE;
    return { pageData: data.slice(start, start + PAGE_SIZE), totalPages, page: clampedPage };
  };

  const topPaged = paginate(topList, topPage);
  const poorPaged = paginate(poorList, poorPage);
  const schoolTopPaged = paginate(schoolTopList, schoolTopPage);
  const schoolPoorPaged = paginate(schoolPoorList, schoolPoorPage);

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setSchoolFilter("ALL");
  };

  const miniBarChart = (data, kind) => {
    // Scale the axis to what this chart actually shows — a "poor" chart maxing out at 30%
    // shouldn't share the same 0-100% scale as the "top" chart and look artificially squashed.
    const maxCompliance = Math.max(...data.map((d) => d.compliance), 0);
    const axisMax = Math.min(100, Math.max(20, Math.ceil((maxCompliance + 5) / 10) * 10));
    // Recharts renders nothing at all — no bar, no label — for a value of exactly 0. Give it a
    // hairline sliver to render against while the label/tooltip still read the true compliance.
    const chartData = data.map((d) => ({ ...d, renderValue: d.compliance === 0 ? axisMax * 0.015 : d.compliance }));
    const color = kind === "top" ? brand.chartTop : brand.critical;
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={<AxisTick />} axisLine={{ stroke: "#C3C2B7" }} tickLine={false} interval={0} />
          <YAxis domain={[0, axisMax]} tick={{ fontSize: 10.5 }} axisLine={{ stroke: "#C3C2B7" }} tickLine={false} unit="%" width={42} />
          <Tooltip content={<RankingTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="renderValue" radius={[6, 6, 0, 0]} maxBarSize={55} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderRankingSection = (title, unitLabel, sectionTopList, sectionPoorList, sectionTopPaged, sectionPoorPaged, setSectionTopPage, setSectionPoorPage) => {
    if (sectionTopList.length === 0 && sectionPoorList.length === 0) return null;
    return (
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1, fontSize: "0.82rem" }}>{title}</Typography>
        {sectionTopList.length > 0 && (
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "#E5E7EB", mb: 1.5 }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: brand.chartTop, flex: "none" }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Top Performing {unitLabel}
                </Typography>
              </Stack>
              {sectionTopPaged.totalPages > 1 && (
                <PageControls
                  page={sectionTopPaged.page}
                  totalPages={sectionTopPaged.totalPages}
                  onPrev={() => setSectionTopPage((p) => Math.max(0, p - 1))}
                  onNext={() => setSectionTopPage((p) => Math.min(sectionTopPaged.totalPages - 1, p + 1))}
                />
              )}
            </Stack>
            {miniBarChart(sectionTopPaged.pageData, "top")}
          </Card>
        )}
        {sectionPoorList.length > 0 && (
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "#E5E7EB" }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: brand.critical, flex: "none" }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Poor Performing {unitLabel}
                </Typography>
              </Stack>
              {sectionPoorPaged.totalPages > 1 && (
                <PageControls
                  page={sectionPoorPaged.page}
                  totalPages={sectionPoorPaged.totalPages}
                  onPrev={() => setSectionPoorPage((p) => Math.max(0, p - 1))}
                  onNext={() => setSectionPoorPage((p) => Math.min(sectionPoorPaged.totalPages - 1, p + 1))}
                />
              )}
            </Stack>
            {miniBarChart(sectionPoorPaged.pageData, "poor")}
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {showLocationFilters && (
            <>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>District</InputLabel>
                <Select label="District" value={districtFilter} onChange={(e) => handleDistrictChange(e.target.value)}>
                  <MenuItem value="ALL">All districts</MenuItem>
                  {baseDistricts.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>School</InputLabel>
                <Select label="School" value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
                  <MenuItem value="ALL">All schools</MenuItem>
                  {schoolsAfterDistrict.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Date range</InputLabel>
            <Select label="Date range" value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
              {Object.entries(DATE_RANGES).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {rangeKey === "CUSTOM" && (
            <>
              <TextField
                label="From"
                type="date"
                size="small"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: earliestDate, max: customTo } }}
                sx={{ width: 155 }}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: customFrom, max: todayDate } }}
                sx={{ width: 155 }}
              />
            </>
          )}
        </Stack>
      </Stack>

      <Box sx={{ mb: 1.5 }}>
        <StatBar
          stats={[
            { label: "Schools", value: scopedSchools.length, sub: `${scopedDistricts.length} district(s)`, icon: <School fontSize="small" />, accent: brand.chartTop },
            { label: "Workers", value: workers, sub: "cleaning staff", icon: <Groups fontSize="small" />, accent: "#8b5cf6" },
            { label: "Toilet blocks", value: toilets.total, sub: `${toilets.boys} boys / ${toilets.girls} girls`, icon: <Wc fontSize="small" />, accent: brand.warning },
            {
              label: `Compliance — ${DATE_RANGES[rangeKey]}`,
              value: `${complianceValue}%`,
              valueColor: complianceValue >= 90 ? brand.good : complianceValue >= 75 ? brand.warning : brand.critical,
              icon: <TrendingUp fontSize="small" />,
              accent: complianceValue >= 90 ? brand.good : complianceValue >= 75 ? brand.warning : brand.critical,
              sub:
                rangeKey === "TODAY" && shiftData[2].boys === null && shiftData[2].girls === null
                  ? "Evening not yet due"
                  : complianceValue >= 90 ? "On target" : complianceValue >= 75 ? "Needs attention" : "Critical",
              subColor: complianceValue >= 90 ? brand.good : complianceValue >= 75 ? brand.warning : brand.critical,
            },
          ]}
        />
      </Box>

      <Card
        variant="outlined"
        sx={{
          p: 2.25,
          borderRadius: 3,
          background: "linear-gradient(180deg, #F4FBF7 0%, #FFFFFF 60%)",
          mb: 1.5,
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>Today's Maintenance Completion</Typography>
          <Box
            sx={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: 0.5,
              color: brand.mainDark,
              bgcolor: `${brand.main}1F`,
              px: 1,
              py: 0.4,
              borderRadius: 5,
            }}
          >
            LIVE · TODAY
          </Box>
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 2.5 }}>
          <GenderCompletionColumn
            label="Boys blocks"
            shifts={todayGenderSummary.boys}
            icon={<Wc fontSize="small" />}
            tint={brand.boysTint}
            tintBorder={brand.boysTintBorder}
            accent={brand.boys}
          />
          <GenderCompletionColumn
            label="Girls blocks"
            shifts={todayGenderSummary.girls}
            icon={<Wc fontSize="small" />}
            tint={brand.girlsTint}
            tintBorder={brand.girlsTintBorder}
            accent={brand.girls}
          />
        </Stack>
      </Card>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {genderPies.map((g) => {
          const data = [
            { name: "Morning", value: g.Morning },
            { name: "Afternoon", value: g.Afternoon },
            { name: "Evening", value: g.Evening },
            { name: incompleteLabel, value: g.Incomplete },
          ];
          const hasBlocks = data.some((d) => d.value > 0);
          const total = data.reduce((s, d) => s + d.value, 0);
          return (
            <Grid key={g.gender} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "#E5E7EB", height: "100%" }}>
                <Typography variant="body1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                  {g.gender === "BOYS" ? "Boys blocks" : "Girls blocks"} — {DATE_RANGES[rangeKey]} · Total: {total}
                </Typography>
                {hasBlocks ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={120}
                          paddingAngle={0}
                          stroke="#fff"
                          strokeWidth={2}
                          label={PieSliceLabel}
                          labelLine={false}
                        >
                          {data.map((d) => (
                            <Cell key={d.name} fill={SHIFT_COLORS[d.name] || SHIFT_COLORS.Pending} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <PieLegend data={data} total={total} />
                  </>
                ) : (
                  <Box sx={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      No {g.gender === "BOYS" ? "boys" : "girls"} blocks in this view
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {n > 0 && renderRankingSection(ranking.title, ranking.unitLabel, topList, poorList, topPaged, poorPaged, setTopPage, setPoorPage)}

      {ranking.level === "district" &&
        renderRankingSection("School performance", "Schools", schoolTopList, schoolPoorList, schoolTopPaged, schoolPoorPaged, setSchoolTopPage, setSchoolPoorPage)}
    </Box>
  );
}
