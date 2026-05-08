import React, { useState, useEffect, useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { config } from '../config';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Sora:wght@300;400;500;600&display=swap');
`;

interface JobSummary {
    id: number;
    title: string;
    company_name: string;
    location: string;
    job_location_type: string;
    job_type: string;
    pay_range_min: number;
    pay_range_max: number;
    pay_type: string;
    required_years_experience: number;
    created_at: string;
}

// --- Animations ---
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;
const sweep = keyframes`
  0%   { left: -40%; }
  100% { left: 100%; }
`;
const scanline = keyframes`
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

// --- Base ---
const PageContainer = styled.div`
    min-height: 100vh;
    overflow-x: hidden;
    font-family: 'Sora', sans-serif;
`;

const Scanline = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(74,222,128,0.15), transparent);
    z-index: 1;
    pointer-events: none;
    animation: ${scanline} 8s linear infinite;
`;

const GridOverlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image:
        linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
`;

const Wrapper = styled.div`
    position: relative;
    z-index: 2;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;

    @media (min-width: 768px) {
        padding: 2.5rem 2.5rem 5rem;
    }
`;

// --- Top bar ---
const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    animation: ${fadeUp} 0.4s ease both;
`;

const LogoLink = styled(Link)`
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LogoMark = styled.div`
    width: 9px; height: 9px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 10px #4ade80, 0 0 20px rgba(74,222,128,0.4);
    animation: ${pulse} 2s ease-in-out infinite;
`;

const LogoText = styled.span`
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #fff;
    text-transform: uppercase;
`;

const LiveBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #4ade80;
    text-transform: uppercase;
    opacity: 0.8;
`;

const LiveDot = styled.div`
    width: 6px; height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

// --- Hero (compact) ---
const Hero = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeUp} 0.4s 0.08s ease both;
`;

const Eyebrow = styled.div`
    font-size: 0.68rem;
    letter-spacing: 0.25em;
    color: #4ade80;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.5rem;
    opacity: 0.8;
`;

const HeroTitle = styled.h1`
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 700;
    line-height: 0.95;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 0.6rem;

    span {
        color: #4ade80;
        text-shadow: 0 0 30px rgba(74,222,128,0.45);
    }
`;

const HeroSub = styled.p`
    font-size: 0.85rem;
    color: #555;
    font-weight: 300;
    line-height: 1.6;
`;

// --- Two-column body ---
const Body = styled.div`
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    animation: ${fadeUp} 0.4s 0.15s ease both;
`;

// --- Filters sidebar ---
const Sidebar = styled.aside`
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 1.5rem;
    display: none;

    @media (min-width: 900px) {
        display: block;
    }
`;

const SidebarTitle = styled.div`
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4ade80;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid rgba(74,222,128,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ClearBtn = styled.button`
    background: none;
    border: none;
    color: #555;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    padding: 0;
    text-transform: uppercase;
    transition: color 0.15s;

    &:hover { color: #4ade80; }
`;

const FilterSection = styled.div`
    margin-bottom: 1.25rem;
`;

const FilterLabel = styled.div`
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #666;
    font-weight: 500;
    margin-bottom: 0.5rem;
`;

const CheckRow = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #aaa;
    cursor: pointer;
    padding: 0.25rem 0;
    transition: color 0.15s;

    &:hover { color: #e0e0e0; }

    input[type='checkbox'] {
        accent-color: #4ade80;
        width: 13px;
        height: 13px;
        cursor: pointer;
    }
`;

const RangeRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RangeInput = styled.input`
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(74,222,128,0.15);
    border-radius: 5px;
    color: #ccc;
    font-size: 0.78rem;
    padding: 0.35rem 0.5rem;
    width: 100%;
    font-family: 'Sora', sans-serif;
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: rgba(74,222,128,0.45); }
    &::placeholder { color: #444; }
`;

const RangeSep = styled.span`
    color: #444;
    font-size: 0.75rem;
    flex-shrink: 0;
`;

const FilterDivider = styled.div`
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 1rem 0;
`;

// --- Job list (right side) ---
const JobListArea = styled.div`
    flex: 1;
    min-width: 0;
`;

const ListMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const ResultCount = styled.div`
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
`;

const MobileFilterToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(74,222,128,0.07);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 6px;
    color: #4ade80;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    transition: background 0.15s;

    &:hover { background: rgba(74,222,128,0.12); }

    @media (min-width: 900px) { display: none; }
`;

const MobileFilters = styled.div<{ $open: boolean }>`
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(74,222,128,0.12);
    border-radius: 10px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;

    @media (min-width: 900px) { display: none; }
`;

const JobCard = styled(Link)<{ $index: number }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(74,222,128,0.1);
    border-radius: 9px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.65rem;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
    backdrop-filter: blur(6px);
    animation: ${fadeUp} 0.4s ${({ $index }) => 0.15 + $index * 0.04}s ease both;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(74,222,128,0.03), transparent);
        opacity: 0;
        transition: opacity 0.2s;
    }

    &:hover {
        border-color: rgba(74,222,128,0.45);
        background: rgba(74,222,128,0.035);
        transform: translateX(3px);
        box-shadow: 0 4px 24px rgba(74,222,128,0.08);
        &::before { opacity: 1; }
    }
`;

const CardMain = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
`;

const CardTitles = styled.div`
    min-width: 180px;
`;

const JobTitle = styled.div`
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f0f0f0;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    line-height: 1.15;
`;

const CompanyName = styled.div`
    font-size: 0.82rem;
    color: #4ade80;
    font-weight: 500;
    opacity: 0.85;
    margin-top: 0.2rem;
`;

const PostedDate = styled.div`
    font-size: 0.72rem;
    color: #555;
    margin-top: 0.2rem;
    letter-spacing: 0.02em;
`;

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
`;

const Tag = styled.span<{ $type?: 'salary' | 'type' | 'location' | 'remote' | 'category' }>`
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.03em;
    padding: 0.25rem 0.65rem;
    border-radius: 4px;
    text-transform: capitalize;
    white-space: nowrap;

    ${({ $type }) => $type === 'salary' && `
        background: rgba(74,222,128,0.08);
        color: #4ade80;
        border: 1px solid rgba(74,222,128,0.18);
    `}
    ${({ $type }) => $type === 'type' && `
        background: rgba(96,165,250,0.07);
        color: #60a5fa;
        border: 1px solid rgba(96,165,250,0.12);
    `}
    ${({ $type }) => ($type === 'location' || $type === 'remote') && `
        background: rgba(255,255,255,0.035);
        color: #777;
        border: 1px solid rgba(255,255,255,0.06);
    `}
    ${({ $type }) => $type === 'category' && `
        background: rgba(251,191,36,0.08);
        color: #fbbf24;
        border: 1px solid rgba(251,191,36,0.18);
    `}
`;

const ArrowWrap = styled.div`
    flex-shrink: 0;
    color: rgba(74,222,128,0.4);
    font-size: 1rem;
    transition: color 0.2s, transform 0.2s;

    ${JobCard}:hover & {
        color: #4ade80;
        transform: translateX(3px);
    }
`;

// --- Empty / Loading ---
const CenterScreen = styled.div`
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #000;
    gap: 1rem;
    font-family: 'Sora', sans-serif;
`;

const LoadingText = styled.div`
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4ade80;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingBar = styled.div`
    width: 120px;
    height: 2px;
    background: rgba(74,222,128,0.12);
    border-radius: 2px;
    overflow: hidden;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        width: 40%;
        height: 100%;
        background: #4ade80;
        animation: ${sweep} 1.2s ease-in-out infinite;
    }
`;

const EmptyBox = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    border: 1px dashed rgba(74,222,128,0.12);
    border-radius: 10px;
    color: #444;
    font-size: 0.85rem;
    letter-spacing: 0.04em;
`;

// --- Helpers ---
function formatSalary(job: JobSummary): string {
    const min = job.pay_range_min;
    const max = job.pay_range_max;
    const payType = job.pay_type || 'hourly';
    if (!min && !max) return '';
    const suffix = payType === 'salary' ? '/yr' : '/hr';
    if (min && max) return `$${min.toLocaleString()}–$${max.toLocaleString()}${suffix}`;
    return min ? `$${min.toLocaleString()}+${suffix}` : `Up to $${max.toLocaleString()}${suffix}`;
}

function formatPostedDate(dateStr: string): string {
    if (!dateStr) return '';
    const posted = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    if (days < 7) return `Posted ${days} days ago`;
    if (days < 14) return 'Posted 1 week ago';
    if (days < 30) return `Posted ${Math.floor(days / 7)} weeks ago`;
    return `Posted ${posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function formatJobType(t: string): string {
    if (!t) return 'Full-time';
    return t.replace(/[_-]/g, ' ');
}

const EXP_BUCKETS = [
    { label: '0–2 years',  min: 0,  max: 2   },
    { label: '3–5 years',  min: 3,  max: 5   },
    { label: '6–10 years', min: 6,  max: 10  },
    { label: '10+ years',  min: 11, max: 999 },
];

const CATEGORIES: { label: string; keywords: string[] }[] = [
    {
        label: 'Office',
        keywords: ['administrative', 'admin', 'bookkeeper', 'dispatcher', 'sales rep', 'sales representative', 'customer service', 'receptionist', 'coordinator', 'clerical', 'office'],
    },
    {
        label: 'Field Technician',
        keywords: ['technician', 'tech', 'installer', 'installation', 'service tech', 'hvac tech', 'refrigeration', 'mechanical'],
    },
    {
        label: 'Management',
        keywords: ['manager', 'supervisor', 'director', 'lead', 'foreman', 'superintendent', 'operations'],
    },
    {
        label: 'Warehouse & Parts',
        keywords: ['warehouse', 'parts', 'inventory', 'driver', 'delivery', 'logistics', 'supply'],
    },
    {
        label: 'Apprentice / Entry Level',
        keywords: ['apprentice', 'helper', 'trainee', 'entry', 'junior', 'assistant tech'],
    },
];

function getCategory(title: string): string {
    const lower = title.toLowerCase();
    for (const cat of CATEGORIES) {
        if (cat.keywords.some(kw => lower.includes(kw))) return cat.label;
    }
    return 'Other';
}

// --- Component ---
const PublicJobList: React.FC = () => {
    const [jobs, setJobs]         = useState<JobSummary[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [mobileFilters, setMobileFilters] = useState(false);

    // Filter state
    const [selCategories, setSelCategories] = useState<string[]>([]);
    const [selLocations, setSelLocations]   = useState<string[]>([]);
    const [selJobTypes,  setSelJobTypes]    = useState<string[]>([]);
    const [selWorkTypes, setSelWorkTypes]   = useState<string[]>([]);
    const [selExpBuckets, setSelExpBuckets] = useState<string[]>([]);
    const [payMin, setPayMin] = useState('');
    const [payMax, setPayMax] = useState('');

    useEffect(() => {
        document.title = 'HVAC Jobs | Talos';
        fetch(`${config.apiUrl}/api/jobs/public`)
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setJobs(d.jobs); else setError('Failed to load'); })
            .catch(() => setError('Failed to load'))
            .finally(() => setLoading(false));
        return () => { document.title = 'Talos'; };
    }, []);

    // Unique filter options derived from jobs
    const locations = useMemo(() =>
        Array.from(new Set(jobs.map(j => j.location).filter(Boolean))).sort(),
    [jobs]);

    const jobTypes = useMemo(() =>
        Array.from(new Set(jobs.map(j => j.job_type).filter(Boolean))).sort(),
    [jobs]);

    const workTypes = useMemo(() =>
        Array.from(new Set(jobs.map(j => j.job_location_type).filter(Boolean))).sort(),
    [jobs]);

    // Filtered results
    const filtered = useMemo(() => {
        return jobs.filter(job => {
            if (selCategories.length && !selCategories.includes(getCategory(job.title))) return false;
            if (selLocations.length && !selLocations.includes(job.location)) return false;
            if (selJobTypes.length  && !selJobTypes.includes(job.job_type))  return false;
            if (selWorkTypes.length && !selWorkTypes.includes(job.job_location_type)) return false;

            if (selExpBuckets.length) {
                const exp = job.required_years_experience ?? 0;
                const match = EXP_BUCKETS.filter(b => selExpBuckets.includes(b.label))
                    .some(b => exp >= b.min && exp <= b.max);
                if (!match) return false;
            }

            const rate = job.pay_range_max || job.pay_range_min || 0;
            if (payMin && rate < parseFloat(payMin)) return false;
            if (payMax && rate > parseFloat(payMax)) return false;

            return true;
        });
    }, [jobs, selCategories, selLocations, selJobTypes, selWorkTypes, selExpBuckets, payMin, payMax]);

    const hasFilters = selCategories.length || selLocations.length || selJobTypes.length ||
        selWorkTypes.length || selExpBuckets.length || payMin || payMax;

    function clearAll() {
        setSelCategories([]); setSelLocations([]); setSelJobTypes([]); setSelWorkTypes([]);
        setSelExpBuckets([]); setPayMin(''); setPayMax('');
    }

    function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
        set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    }

    if (loading) {
        return (
            <CenterScreen>
                <FontImport />
                <LoadingText>Loading positions</LoadingText>
                <LoadingBar />
            </CenterScreen>
        );
    }

    const FiltersContent = () => (
        <>
            <FilterSection>
                <FilterLabel>Category</FilterLabel>
                {CATEGORIES.map(cat => (
                    <CheckRow key={cat.label}>
                        <input type="checkbox"
                            checked={selCategories.includes(cat.label)}
                            onChange={() => toggle(selCategories, cat.label, setSelCategories)}
                        />
                        {cat.label}
                    </CheckRow>
                ))}
            </FilterSection>

            {locations.length > 0 && (
                <>
                <FilterDivider />
                <FilterSection>
                    <FilterLabel>Location</FilterLabel>
                    {locations.map(loc => (
                        <CheckRow key={loc}>
                            <input type="checkbox"
                                checked={selLocations.includes(loc)}
                                onChange={() => toggle(selLocations, loc, setSelLocations)}
                            />
                            {loc}
                        </CheckRow>
                    ))}
                </FilterSection>
                </>
            )}

            {jobTypes.length > 0 && (
                <>
                    <FilterDivider />
                    <FilterSection>
                        <FilterLabel>Job Type</FilterLabel>
                        {jobTypes.map(t => (
                            <CheckRow key={t}>
                                <input type="checkbox"
                                    checked={selJobTypes.includes(t)}
                                    onChange={() => toggle(selJobTypes, t, setSelJobTypes)}
                                />
                                {formatJobType(t)}
                            </CheckRow>
                        ))}
                    </FilterSection>
                </>
            )}

            {workTypes.length > 0 && (
                <>
                    <FilterDivider />
                    <FilterSection>
                        <FilterLabel>Work Type</FilterLabel>
                        {workTypes.map(t => (
                            <CheckRow key={t}>
                                <input type="checkbox"
                                    checked={selWorkTypes.includes(t)}
                                    onChange={() => toggle(selWorkTypes, t, setSelWorkTypes)}
                                />
                                {t}
                            </CheckRow>
                        ))}
                    </FilterSection>
                </>
            )}

            <FilterDivider />
            <FilterSection>
                <FilterLabel>Pay Rate</FilterLabel>
                <RangeRow>
                    <RangeInput
                        type="number"
                        placeholder="Min"
                        value={payMin}
                        onChange={e => setPayMin(e.target.value)}
                    />
                    <RangeSep>–</RangeSep>
                    <RangeInput
                        type="number"
                        placeholder="Max"
                        value={payMax}
                        onChange={e => setPayMax(e.target.value)}
                    />
                </RangeRow>
            </FilterSection>

            <FilterDivider />
            <FilterSection>
                <FilterLabel>Experience</FilterLabel>
                {EXP_BUCKETS.map(b => (
                    <CheckRow key={b.label}>
                        <input type="checkbox"
                            checked={selExpBuckets.includes(b.label)}
                            onChange={() => toggle(selExpBuckets, b.label, setSelExpBuckets)}
                        />
                        {b.label}
                    </CheckRow>
                ))}
            </FilterSection>
        </>
    );

    return (
        <PageContainer>
            <FontImport />
            <Scanline />
            <GridOverlay />

            <Wrapper>
                <TopBar>
                    <LogoLink to="/">
                        <LogoMark />
                        <LogoText>Talos</LogoText>
                    </LogoLink>
                    <LiveBadge><LiveDot />Live openings</LiveBadge>
                </TopBar>

                <Hero>
                    <Eyebrow>HVAC Career Opportunities</Eyebrow>
                    <HeroTitle>Apply to <span>HVAC Jobs</span></HeroTitle>
                    <HeroSub>Direct applications. No middleman. Get hired faster.</HeroSub>
                </Hero>

                <Body>
                    {/* Desktop sidebar */}
                    <Sidebar>
                        <SidebarTitle>
                            Filters
                            {hasFilters ? <ClearBtn onClick={clearAll}>Clear all</ClearBtn> : null}
                        </SidebarTitle>
                        <FiltersContent />
                    </Sidebar>

                    {/* Job list */}
                    <JobListArea>
                        <ListMeta>
                            <ResultCount>
                                {filtered.length} {filtered.length === 1 ? 'position' : 'positions'} found
                            </ResultCount>
                            <MobileFilterToggle onClick={() => setMobileFilters(v => !v)}>
                                ⚙ Filters {hasFilters ? `(${[selLocations, selJobTypes, selWorkTypes, selExpBuckets].flat().length + (payMin ? 1 : 0) + (payMax ? 1 : 0)})` : ''}
                            </MobileFilterToggle>
                        </ListMeta>

                        {/* Mobile filters */}
                        <MobileFilters $open={mobileFilters}>
                            <SidebarTitle>
                                Filters
                                {hasFilters ? <ClearBtn onClick={clearAll}>Clear all</ClearBtn> : null}
                            </SidebarTitle>
                            <FiltersContent />
                        </MobileFilters>

                        {error ? (
                            <EmptyBox>Failed to load positions — please try again.</EmptyBox>
                        ) : filtered.length === 0 ? (
                            <EmptyBox>
                                {hasFilters ? 'No positions match your filters.' : 'No open positions at this time.'}
                            </EmptyBox>
                        ) : (
                            filtered.map((job, i) => {
                                const salary = formatSalary(job);
                                const jobType = formatJobType(job.job_type);
                                return (
                                    <JobCard key={job.id} to={`/jobs/${job.id}`} $index={i}>
                                        <CardMain>
                                            <CardTitles>
                                                <JobTitle>{job.title}</JobTitle>
                                                <CompanyName>{job.company_name || 'Company'}</CompanyName>
                                                {job.created_at && <PostedDate>{formatPostedDate(job.created_at)}</PostedDate>}
                                            </CardTitles>
                                            <TagRow>
                                                <Tag $type="category">{getCategory(job.title)}</Tag>
                                                {job.location && <Tag $type="location">📍 {job.location}</Tag>}
                                                <Tag $type="type">{jobType}</Tag>
                                                {salary && <Tag $type="salary">{salary}</Tag>}
                                                {job.job_location_type && <Tag $type="remote">{job.job_location_type}</Tag>}
                                            </TagRow>
                                        </CardMain>
                                        <ArrowWrap>→</ArrowWrap>
                                    </JobCard>
                                );
                            })
                        )}
                    </JobListArea>
                </Body>
            </Wrapper>
        </PageContainer>
    );
};

export default PublicJobList;
