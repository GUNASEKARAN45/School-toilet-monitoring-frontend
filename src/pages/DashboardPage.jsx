import { useMemo, useState } from "react";
import { Box, Card, Grid, Typography, MenuItem, Select, FormControl, InputLabel, Stack, TextField } from "@mui/material";
import { School, Groups, Wc, TrendingUp } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  schools, schoolIdsForUser, districtsInScope,
  complianceByShift, overallCompliance, genderShiftStatus,
  rankSchools, rankDistricts, rankToiletBlocks, totalWorkers, toiletTotals,
  DATE_RANGES, getDatesForRange, earliestDate, todayDate, recentDays,
} from "../data/dummyData";
import { brand, SHIFT_COLORS } from "../theme";
import StatTile from "../components/StatTile";

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

function BarValueLabel({ x, y, width, value }) {
  // A 0% bar has no rendered height, so without this the value is invisible until hovered —
  // always draw the number just above the bar's top (which is the baseline itself when value is 0).
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#52514e">
      {value}%
    </text>
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

  // Poor performing = genuinely below 50% compliance, not just "the bottom half" — so the two
  // charts reflect an actual quality bar rather than an arbitrary split.
  const n = ranking.data.length;
  const topList = ranking.data.filter((d) => d.compliance >= 50);
  const poorList = ranking.data.filter((d) => d.compliance < 50);

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setSchoolFilter("ALL");
  };

  const miniBarChart = (data, color) => {
    // Scale the axis to what this chart actually shows — a "poor" chart maxing out at 30%
    // shouldn't share the same 0-100% scale as the "top" chart and look artificially squashed.
    const maxCompliance = Math.max(...data.map((d) => d.compliance), 0);
    const axisMax = Math.min(100, Math.max(20, Math.ceil((maxCompliance + 5) / 10) * 10));
    // Recharts renders nothing at all — no bar, no label — for a value of exactly 0. Give it a
    // hairline sliver to render against while the label/tooltip still read the true compliance.
    const chartData = data.map((d) => ({ ...d, renderValue: d.compliance === 0 ? axisMax * 0.015 : d.compliance }));
    return (
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={<AxisTick />} axisLine={{ stroke: "#C3C2B7" }} tickLine={false} interval={0} />
          <YAxis domain={[0, axisMax]} tick={{ fontSize: 10.5 }} axisLine={false} tickLine={false} unit="%" width={42} />
          <Tooltip content={<RankingTooltip />} />
          <Bar dataKey="renderValue" radius={[4, 4, 0, 0]} maxBarSize={46} fill={color}>
            <LabelList dataKey="compliance" content={<BarValueLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Dashboard</Typography>
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

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Schools" value={scopedSchools.length} sub={`${scopedDistricts.length} district(s)`} accentColor={brand.boys} icon={<School fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Workers" value={workers} sub="cleaning staff" accentColor="#1baf7a" icon={<Groups fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Toilet blocks" value={toilets.total} sub={`${toilets.boys} boys / ${toilets.girls} girls`} accentColor="#4a3aa7" icon={<Wc fontSize="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label={`Compliance — ${DATE_RANGES[rangeKey]}`}
            value={`${complianceValue}%`}
            sub={
              rangeKey === "TODAY" && shiftData[2].boys === null && shiftData[2].girls === null
                ? "Evening not yet due"
                : complianceValue >= 90 ? "On target" : complianceValue >= 75 ? "Needs attention" : "Critical"
            }
            subColor={complianceValue >= 90 ? brand.good : complianceValue >= 75 ? brand.warning : brand.critical}
            accentColor={complianceValue >= 90 ? brand.good : complianceValue >= 75 ? brand.warning : brand.critical}
            icon={<TrendingUp fontSize="small" />}
          />
        </Grid>
      </Grid>

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
              <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, height: "100%" }}>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.82rem" }}>
                  {g.gender === "BOYS" ? "Boys blocks" : "Girls blocks"} — {DATE_RANGES[rangeKey]}
                </Typography>
                {hasBlocks ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, "& svg:focus, & svg *:focus": { outline: "none" } }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                          <Pie data={data} dataKey="value" nameKey="name" outerRadius={78} paddingAngle={1.5} stroke="#fff" strokeWidth={2}>
                            {data.map((d) => (
                              <Cell key={d.name} fill={SHIFT_COLORS[d.name] || SHIFT_COLORS.Pending} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stack spacing={0.9} sx={{ flex: "none", pr: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>Total: {total}</Typography>
                      {data.map((d) => (
                        <Stack key={d.name} direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: SHIFT_COLORS[d.name] || SHIFT_COLORS.Pending, flex: "none" }} />
                          <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.secondary" }}>{d.name}: {d.value}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

      {n > 0 && (
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1, fontSize: "0.82rem" }}>{ranking.title}</Typography>
          {topList.length > 0 && (
            <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: brand.good }}>
                Top Performing {ranking.unitLabel}
              </Typography>
              {miniBarChart(topList, brand.good)}
            </Card>
          )}
          {poorList.length > 0 && (
            <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: brand.critical }}>
                Poor Performing {ranking.unitLabel}
              </Typography>
              {miniBarChart(poorList, brand.critical)}
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
