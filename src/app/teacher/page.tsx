"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowRight,
  Bell,
  BookMarked,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Download,
  FileText,
  Gamepad2,
  LayoutDashboard,
  Layers3,
  Menu,
  Megaphone,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";

/* =========================================================
   TEACHER IMAGE
========================================================= */

const teacherGender: string = "female";

const teacherImage =
  teacherGender === "male"
    ? "/images/teachers/teacher_hero_male.png"
    : "/images/teachers/teacher_hero_female.png";

/* =========================================================
   TYPES
========================================================= */

type ScheduleType =
  | "reading"
  | "prep"
  | "tuition"
  | "online";

type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  location: string;
  type: ScheduleType;
};

type RecentType =
  | "slide"
  | "module"
  | "worksheet"
  | "game";

type RecentItem = {
  title: string;
  activity: string;
  type: RecentType;
};

/* =========================================================
   DEMO SCHEDULE
========================================================= */

const initialSchedule: ScheduleItem[] = [
  {
    id: 1,
    time: "10:00 AM",
    title: "Reading Class — Kad 1",
    location: "Taman Koperasi Perdana",
    type: "reading",
  },
  {
    id: 2,
    time: "2:00 PM",
    title: "Prepare Worksheets",
    location: "At Home",
    type: "prep",
  },
  {
    id: 3,
    time: "4:00 PM",
    title: "Tuition Group A",
    location: "Taman Koperasi Perdana",
    type: "tuition",
  },
  {
    id: 4,
    time: "8:00 PM",
    title: "Online Reading Class",
    location: "Online",
    type: "online",
  },
];

/* =========================================================
   RECENT MATERIALS
========================================================= */

const recentMaterials: RecentItem[] = [
  {
    title: "Kad 1 — Teaching Slides",
    activity: "Viewed 2 hours ago",
    type: "slide",
  },
  {
    title: "Module 1 — Suku Kata Asas",
    activity: "Downloaded yesterday",
    type: "module",
  },
  {
    title: "Premium Worksheet — Activity 5",
    activity: "Downloaded 2 days ago",
    type: "worksheet",
  },
  {
    title: "Digital Game — Bina Perkataan",
    activity: "Played 3 days ago",
    type: "game",
  },
];

/* =========================================================
   ANNOUNCEMENTS
========================================================= */

const announcements = [
  {
    tag: "NEW",
    tagClass: "bg-[#fff0f4] text-[#e66d8d]",
    title: "New Worksheet Activities Added",
    description:
      "New reading activities are now available in your worksheet library.",
    date: "10 Sep 2026",
  },
  {
    tag: "UPDATE",
    tagClass: "bg-[#eef6ff] text-[#438fd7]",
    title: "Digital Games Updated",
    description:
      "More interactive reading activities are now available.",
    date: "5 Sep 2026",
  },
  {
    tag: "INFO",
    tagClass: "bg-[#eafaf4] text-[#38a77c]",
    title: "Your Teacher Access is Active",
    description:
      "Your current access includes all available Teacher Set resources.",
    date: "1 Sep 2026",
  },
];

/* =========================================================
   CALENDAR
========================================================= */

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function getDaysInMonth(
  year: number,
  month: number
) {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

function getFirstDay(
  year: number,
  month: number
) {
  return new Date(
    year,
    month,
    1
  ).getDay();
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TeacherPage() {
  const today = new Date();

  const [month, setMonth] = useState(
    today.getMonth()
  );

  const [year, setYear] = useState(
    today.getFullYear()
  );

  const [selectedDay, setSelectedDay] =
    useState(today.getDate());

  const [schedule, setSchedule] =
    useState<ScheduleItem[]>(
      initialSchedule
    );

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  const [newSchedule, setNewSchedule] =
    useState({
      time: "",
      title: "",
      location: "",
      type: "reading" as ScheduleType,
    });

  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const calendarDays = useMemo(() => {
    const firstDay = getFirstDay(
      year,
      month
    );

    const totalDays = getDaysInMonth(
      year,
      month
    );

    const previousMonthTotal =
      getDaysInMonth(
        year,
        month - 1
      );

    const days: {
      day: number;
      current: boolean;
      key: string;
    }[] = [];

    for (
      let i = firstDay - 1;
      i >= 0;
      i--
    ) {
      const day =
        previousMonthTotal - i;

      days.push({
        day,
        current: false,
        key: `previous-${day}`,
      });
    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      days.push({
        day,
        current: true,
        key: `current-${day}`,
      });
    }

    let nextDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextDay,
        current: false,
        key: `next-${nextDay}`,
      });

      nextDay++;
    }

    return days;
  }, [month, year]);

  /* =======================================================
     CHANGE MONTH
  ======================================================= */

  function changeMonth(
    direction: number
  ) {
    let nextMonth =
      month + direction;

    let nextYear = year;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDay(1);
  }

  /* =======================================================
     ADD SCHEDULE
  ======================================================= */

  function handleAddSchedule() {
    if (
      !newSchedule.time ||
      !newSchedule.title
    ) {
      return;
    }

    const item: ScheduleItem = {
      id: Date.now(),
      time: newSchedule.time,
      title: newSchedule.title,
      location:
        newSchedule.location.trim() ||
        "At Home",
      type: newSchedule.type,
    };

    setSchedule((current) => [
      ...current,
      item,
    ]);

    setNewSchedule({
      time: "",
      title: "",
      location: "",
      type: "reading",
    });

    setShowScheduleModal(false);
  }

  /* =======================================================
     DELETE SCHEDULE
  ======================================================= */

  function deleteSchedule(id: number) {
    setSchedule((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfafc] text-[#17233f]">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px]
          flex-col
          border-r border-[#eeeaf2]
          bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* LOGO */}

        <div className="flex h-[100px] items-center px-6">

          <img
            src="/fd-arcadia-logo1.png"
            alt="FD Arcadia Learning Hub"
            className="h-auto max-h-[62px] w-auto max-w-[205px] object-contain"
          />

          <button
            onClick={() =>
              setMobileOpen(false)
            }
            className="ml-auto rounded-xl p-2 text-[#8c94a5] hover:bg-[#faf7fa] lg:hidden"
          >
            <X size={19} />
          </button>

        </div>

        {/* SIDEBAR LABEL */}

        <div className="px-6 pb-3">

          <p className="text-[9px] font-bold tracking-[0.25em] text-[#a0a7b4]">
            TEACHER PORTAL
          </p>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-4 pb-5">

          <SidebarItem
            icon={
              <LayoutDashboard size={19} />
            }
            label="Dashboard"
            active
          />

          <SidebarItem
            icon={
              <Layers3 size={19} />
            }
            label="Digital Reading Modules"
            arrow
          />

          <SidebarItem
            icon={
              <BookMarked size={19} />
            }
            label="Flashcards"
          />

          <SidebarItem
            icon={
              <Gamepad2 size={19} />
            }
            label="Digital Games"
          />

          <SidebarItem
            icon={
              <FileText size={19} />
            }
            label="Worksheets"
          />

          <SidebarItem
            icon={
              <Download size={19} />
            }
            label="My Downloads"
          />

          <SidebarItem
            icon={
              <CalendarDays size={19} />
            }
            label="My Teaching Schedule"
          />

          <div className="my-4 h-px bg-[#eeeaf2]" />

          <SidebarItem
            icon={
              <User size={19} />
            }
            label="My Account"
          />

        </nav>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="min-h-screen lg:ml-[270px]">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#eeeaf2]/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="rounded-xl p-2 hover:bg-[#faf7fa] lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="hidden h-[42px] w-[430px] items-center gap-3 rounded-full border border-[#eeeaf2] bg-[#fcfbfd] px-4 md:flex">

              <Search
                size={18}
                className="text-[#9ca3b2]"
              />

              <input
                type="text"
                placeholder="Search materials, modules, worksheets..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a2a8b4]"
              />

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button className="relative rounded-full p-2.5 hover:bg-[#faf7fa]">

              <Bell
                size={20}
                className="text-[#26334f]"
              />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef7897]" />

            </button>

            <div className="hidden h-8 w-px bg-[#eeeaf2] sm:block" />

            <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[#faf7fa]">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f58ca7] to-[#ed6e91] text-sm font-black text-white shadow-sm">
                T
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-bold">
                  Teacher
                </p>

                <p className="text-[10px] text-[#8d95a6]">
                  Welcome back!
                </p>

              </div>

              <ChevronDown
                size={15}
                className="hidden text-[#7d8597] sm:block"
              />

            </button>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

          <div className="mx-auto max-w-[1500px]">

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="min-w-0">

                {/* =================================================
                    PREMIUM TEACHER HERO
                ================================================= */}

                <section className="relative min-h-[410px] overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-[#fff5f7] via-[#fffaf8] to-[#eef9f5] px-7 py-8 shadow-[0_16px_45px_rgba(42,36,57,0.06)] sm:px-10 lg:px-11">

                  {/* SOFT BACKGROUND GLOW — NO CIRCLE */}

                  <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/75 blur-3xl" />

                  <div className="pointer-events-none absolute bottom-[-110px] left-[22%] h-72 w-72 rounded-full bg-[#f7dce7]/18 blur-3xl" />

                  <div className="pointer-events-none absolute right-[-90px] bottom-[-80px] h-72 w-72 rounded-full bg-[#dff4ed]/35 blur-3xl" />

                  {/* =================================================
                      LEFT CONTENT
                  ================================================= */}

                  <div className="relative z-20 w-full lg:max-w-[59%]">

                    <p className="font-kindergarten text-[11px] font-medium tracking-[0.20em] text-[#68748d] sm:text-xs">
                      FD ARCADIA LEARNING HUB
                    </p>

                    <h1 className="font-kindergarten mt-4 whitespace-nowrap text-[42px] font-semibold leading-[1.02] tracking-[-0.025em] text-[#17233f] sm:text-[50px] lg:text-[56px]">
                      Hello, Teacher!
                      <span className="ml-2 text-[#ef7897]">♥</span>
                    </h1>

                    <p className="font-kindergarten mt-7 max-w-[510px] text-[27px] italic leading-[1.16] text-[#35415f] sm:text-[30px]">
                      Ready to make reading fun
                      <br />
                      today?
                    </p>

                    <p className="font-kindergarten mt-4 max-w-[550px] text-[16px] leading-[1.55] text-[#788398] sm:text-[17px]">
                      Everything you need to teach reading, all in one
                      beautiful space. Explore your materials, games and
                      teaching resources.
                    </p>

                    {/* BENEFITS — CLEAN 2 × 2 */}

                    <div className="relative z-30 mt-7 grid max-w-[560px] grid-cols-2 gap-3">

                      <Benefit text="Quality Materials" />

                      <Benefit text="Easy to Use" />

                      <Benefit text="Support Learners" />

                      <Benefit text="Save Time" />

                    </div>

                  </div>

                  {/* =================================================
                      TEACHER ARTWORK
                      SMALLER + HIGHER
                      NO CIRCLE / NO BORDER
                  ================================================= */}

                  <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[39%] lg:block">

                    <img
                      src={teacherImage}
                      alt=""
                      className="absolute bottom-[138px] right-[3%] z-10 h-[190px] w-auto max-w-none object-contain drop-shadow-[0_14px_18px_rgba(70,50,60,0.10)]"
                    />

                  </div>

                </section>

                {/* =================================================
                    RESOURCE CARDS
                    READING TEACHER SET REMOVED
                ================================================= */}

                <section className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">

                  {/* DIGITAL MODULES */}

                  <ResourceCard
                    title="Digital Reading Modules"
                    description="3 structured digital modules"
                    button="View Modules"
                    background="from-[#eafaf4] to-[#f7fffb]"
                    buttonColor="bg-[#35b986]"
                    visual={
                      <div className="relative flex h-[76px] items-center justify-center">

                        <div className="absolute -left-4 top-3 h-10 w-10 rounded-full bg-white/60" />

                        <div className="relative text-[50px] leading-none">
                          📚
                        </div>

                      </div>
                    }
                  />

                  {/* FLASHCARDS */}

                  <ResourceCard
                    title="Flashcard Library"
                    description="Kad 1 – 6 softcopy"
                    button="Open Library"
                    background="from-[#f4f0ff] to-[#fcfaff]"
                    buttonColor="bg-[#8c71dc]"
                    visual={
                      <div className="flex h-[76px] items-center justify-center">

                        <div className="rounded-2xl border-[3px] border-[#cdbef1] bg-white px-6 py-2 text-[38px] font-normal leading-none text-[#26334f] shadow-sm">
                          ba
                        </div>

                      </div>
                    }
                  />

                  {/* DIGITAL GAMES */}

                  <ResourceCard
                    title="Digital Games"
                    description={
                      <>
                        Baca Perkataan
                        <br />
                        Bina Perkataan
                      </>
                    }
                    button="Play Now"
                    background="from-[#eef7ff] to-[#f8fbff]"
                    buttonColor="bg-[#4b9ee7]"
                    visual={
                      <div className="flex h-[76px] items-center justify-center">

                        <div className="text-[53px] leading-none">
                          🎮
                        </div>

                      </div>
                    }
                  />

                  {/* WORKSHEETS */}

                  <ResourceCard
                    title="Premium Worksheets"
                    description={
                      <>
                        18 activities
                        <br />
                        80+ pages
                      </>
                    }
                    button="View Worksheets"
                    background="from-[#fff5e9] to-[#fffaf3]"
                    buttonColor="bg-[#f1a044]"
                    visual={
                      <div className="flex h-[76px] items-center justify-center">

                        <div className="relative">

                          <div className="h-[52px] w-[43px] rotate-[-4deg] rounded-sm border border-[#d9d5cf] bg-white p-1.5 shadow-sm">

                            <div className="space-y-1">
                              <div className="h-1 rounded bg-[#d6d1cb]" />
                              <div className="h-1 w-[80%] rounded bg-[#e1ddd7]" />
                              <div className="h-1 rounded bg-[#d6d1cb]" />
                              <div className="h-1 w-[65%] rounded bg-[#e1ddd7]" />
                            </div>

                          </div>

                          <div className="absolute -bottom-2 -right-5 rotate-[18deg] text-[30px]">
                            ✏️
                          </div>

                        </div>

                      </div>
                    }
                  />

                </section>

                {/* =================================================
                    QUICK ACCESS
                ================================================= */}

                <section className="mt-5 rounded-[27px] border border-[#eeeaf2] bg-white p-5 shadow-[0_8px_25px_rgba(42,36,57,0.035)]">

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#ef7897]">
                        YOUR RESOURCES
                      </p>

                      <h2 className="mt-1 text-[15px] font-black text-[#17233f]">
                        Quick Access
                      </h2>

                    </div>

                    <button className="text-[10px] font-bold text-[#ef7897]">
                      View All
                    </button>

                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                    <QuickCard
                      icon="📘"
                      title="Module 1"
                      subtitle="Suku Kata Asas"
                      background="bg-[#effaf6]"
                    />

                    <QuickCard
                      icon="📗"
                      title="Module 2"
                      subtitle="Reading Practice"
                      background="bg-[#f1f7ff]"
                    />

                    <QuickCard
                      icon="📙"
                      title="Module 3"
                      subtitle="Word Building"
                      background="bg-[#fff7eb]"
                    />

                    <QuickCard
                      icon="📥"
                      title="My Downloads"
                      subtitle="All resources"
                      background="bg-[#f7f2ff]"
                    />

                  </div>

                </section>

                {/* =================================================
                    RECENT + ANNOUNCEMENTS
                ================================================= */}

                <section className="mt-5 grid gap-5 lg:grid-cols-2">

                  {/* RECENT */}

                  <section className="rounded-[27px] border border-[#eeeaf2] bg-white p-5 shadow-[0_8px_25px_rgba(42,36,57,0.035)]">

                    <SectionHeading
                      icon={
                        <Clock3 size={18} />
                      }
                      iconBackground="bg-[#f1f4ff]"
                      iconColor="text-[#6373c8]"
                      title="Recent Materials"
                      action="View All"
                    />

                    <div className="space-y-1">

                      {recentMaterials.map(
                        (item) => (
                          <RecentMaterial
                            key={item.title}
                            item={item}
                          />
                        )
                      )}

                    </div>

                  </section>

                  {/* ANNOUNCEMENTS */}

                  <section className="rounded-[27px] border border-[#eeeaf2] bg-white p-5 shadow-[0_8px_25px_rgba(42,36,57,0.035)]">

                    <SectionHeading
                      icon={
                        <Megaphone size={18} />
                      }
                      iconBackground="bg-[#fff1f4]"
                      iconColor="text-[#ef7897]"
                      title="Announcements"
                      action="View All"
                    />

                    <div className="space-y-1">

                      {announcements.map(
                        (item) => (
                          <div
                            key={item.title}
                            className="flex gap-3 rounded-2xl p-3 transition hover:bg-[#fcf9fc]"
                          >

                            <span
                              className={`
                                mt-0.5 h-fit
                                rounded-full
                                px-2.5 py-1
                                text-[9px]
                                font-black
                                ${item.tagClass}
                              `}
                            >
                              {item.tag}
                            </span>

                            <div className="min-w-0 flex-1">

                              <p className="text-xs font-bold text-[#26334f]">
                                {item.title}
                              </p>

                              <p className="mt-1 text-[10px] leading-5 text-[#8c94a5]">
                                {item.description}
                              </p>

                              <p className="mt-1 text-[9px] text-[#a4abb8]">
                                {item.date}
                              </p>

                            </div>

                            <ChevronRight
                              size={15}
                              className="mt-1 shrink-0 text-[#b6bcc6]"
                            />

                          </div>
                        )
                      )}

                    </div>

                  </section>

                </section>

                {/* =================================================
                    BOTTOM MESSAGE
                ================================================= */}

                <section className="relative mt-5 overflow-hidden rounded-[27px] bg-gradient-to-r from-[#fff0f5] via-[#fff7ee] to-[#effaf7] px-6 py-5">

                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/60 blur-xl" />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="font-[cursive] text-[22px] text-[#35415d]">
                        Every lesson makes a difference. ♥
                      </p>

                      <p className="mt-1 text-[10px] text-[#858e9f]">
                        Keep inspiring young readers, one step at a time.
                      </p>

                    </div>

                    <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7897] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(239,120,151,0.25)]">
                      Explore Resources
                      <ArrowRight size={14} />
                    </button>

                  </div>

                </section>

              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <aside className="space-y-5">

                {/* =================================================
                    TEACHING SCHEDULE
                ================================================= */}

                <section className="overflow-hidden rounded-[29px] border border-[#eeeaf2] bg-white shadow-[0_10px_30px_rgba(42,36,57,0.045)]">

                  <div className="flex items-center justify-between border-b border-[#f0edf2] px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0f4] text-[#ef7897]">
                        <CalendarDays size={18} />
                      </div>

                      <div>

                        <h2 className="text-sm font-black">
                          My Teaching Schedule
                        </h2>

                        <p className="mt-0.5 text-[9px] text-[#9299a8]">
                          Plan your teaching day
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setShowScheduleModal(true)
                      }
                      className="flex items-center gap-1 rounded-full bg-[#ef7897] px-3 py-1.5 text-[10px] font-black text-white transition hover:bg-[#e76f8e]"
                    >
                      <Plus size={13} />
                      Add
                    </button>

                  </div>

                  {/* CALENDAR */}

                  <div className="px-5 pt-4">

                    <div className="flex items-center justify-between">

                      <button
                        onClick={() =>
                          changeMonth(-1)
                        }
                        className="rounded-xl p-2 hover:bg-[#faf7fa]"
                      >
                        <ChevronLeft size={17} />
                      </button>

                      <p className="text-sm font-black">
                        {months[month]} {year}
                      </p>

                      <button
                        onClick={() =>
                          changeMonth(1)
                        }
                        className="rounded-xl p-2 hover:bg-[#faf7fa]"
                      >
                        <ChevronRight size={17} />
                      </button>

                    </div>

                    <div className="mt-3 grid grid-cols-7 text-center">

                      {weekdays.map(
                        (day) => (
                          <div
                            key={day}
                            className="pb-2 text-[9px] font-bold text-[#9ca3b2]"
                          >
                            {day}
                          </div>
                        )
                      )}

                      {calendarDays.map(
                        (cell) => {

                          const selected =
                            cell.current &&
                            cell.day ===
                              selectedDay;

                          const hasEvent =
                            cell.current &&
                            [
                              3,
                              8,
                              12,
                              15,
                              24,
                              29,
                            ].includes(
                              cell.day
                            );

                          return (
                            <button
                              key={cell.key}
                              disabled={
                                !cell.current
                              }
                              onClick={() => {
                                if (
                                  cell.current
                                ) {
                                  setSelectedDay(
                                    cell.day
                                  );
                                }
                              }}
                              className="relative flex h-9 items-center justify-center"
                            >

                              <span
                                className={`
                                  flex h-8 w-8
                                  items-center
                                  justify-center
                                  rounded-full
                                  text-[10px]
                                  font-medium
                                  transition
                                  ${
                                    selected
                                      ? "bg-[#ef7897] font-black text-white shadow-sm"
                                      : cell.current
                                      ? "text-[#26334f] hover:bg-[#f8f4f7]"
                                      : "text-[#c8ccd3]"
                                  }
                                `}
                              >
                                {cell.day}
                              </span>

                              {hasEvent &&
                                !selected && (
                                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#ef7897]" />
                                )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* DAILY SCHEDULE */}

                  <div className="mt-3 border-t border-[#f0edf2] px-5 py-4">

                    <div className="mb-3 flex items-center justify-between">

                      <div>

                        <p className="text-xs font-black">
                          {selectedDay ===
                            today.getDate() &&
                          month ===
                            today.getMonth() &&
                          year ===
                            today.getFullYear()
                            ? "Today"
                            : `${months[month]} ${selectedDay}`}
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#9299a8]">
                          Your teaching schedule
                        </p>

                      </div>

                      <button className="text-[10px] font-bold text-[#ef7897]">
                        View All
                      </button>

                    </div>

                    <div className="space-y-2">

                      {schedule.map(
                        (item) => {

                          const styles =
                            getScheduleStyle(
                              item.type
                            );

                          return (
                            <div
                              key={item.id}
                              className="group flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#fcf9fc]"
                            >

                              <span
                                className={`
                                  w-[66px]
                                  shrink-0
                                  rounded-lg
                                  px-2 py-2
                                  text-center
                                  text-[9px]
                                  font-black
                                  ${styles.time}
                                `}
                              >
                                {item.time}
                              </span>

                              <span
                                className={`
                                  h-2 w-2
                                  shrink-0
                                  rounded-full
                                  ${styles.dot}
                                `}
                              />

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-[10px] font-bold text-[#293650]">
                                  {item.title}
                                </p>

                                <p className="truncate text-[8px] text-[#9ca3b1]">
                                  {item.location}
                                </p>

                              </div>

                              <button
                                onClick={() =>
                                  deleteSchedule(
                                    item.id
                                  )
                                }
                                className="opacity-0 transition group-hover:opacity-100"
                              >
                                <X
                                  size={13}
                                  className="text-[#aab0bc]"
                                />
                              </button>

                            </div>
                          );
                        }
                      )}

                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#fff0f4] py-3 text-[10px] font-black text-[#e66d8d] transition hover:bg-[#ffe6ed]">
                      <CalendarDays
                        size={14}
                      />
                      View Full Schedule
                      <ArrowRight
                        size={13}
                      />
                    </button>

                  </div>

                </section>

                {/* =================================================
                    MOTIVATIONAL CARD
                ================================================= */}

                <section className="relative min-h-[200px] overflow-hidden rounded-[29px] bg-gradient-to-br from-[#f6f0ff] via-[#fff3f7] to-[#fff8ed] p-6">

                  <div className="relative z-10">

                    <p className="font-[cursive] text-[25px] italic leading-[1.15] text-[#303c59]">
                      Teach.
                      <br />
                      Inspire.
                      <br />
                      Make a Difference.
                      <span className="text-[#ef7897]">
                        {" "}♥
                      </span>
                    </p>

                    <p className="mt-5 max-w-[220px] text-[10px] leading-5 text-[#8790a2]">
                      Your work today helps build
                      confident readers tomorrow.
                    </p>

                  </div>

                  <div className="absolute -bottom-10 right-[-5px] text-[80px] opacity-40">
                    ✿
                  </div>

                </section>

                {/* =================================================
                    ACCESS CARD
                ================================================= */}

                <section className="rounded-[29px] border border-[#eeeaf2] bg-white p-5 shadow-[0_10px_30px_rgba(42,36,57,0.04)]">

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3d8] text-[#c78a25]">
                        <Crown size={18} />
                      </div>

                      <div>

                        <p className="text-sm font-black">
                          Your Access
                        </p>

                        <p className="text-[9px] text-[#8c94a5]">
                          Reading Teacher Set
                        </p>

                      </div>

                    </div>

                    <span className="flex items-center gap-1 rounded-full bg-[#eafaf4] px-2.5 py-1 text-[9px] font-black text-[#38a77c]">

                      <span className="h-1.5 w-1.5 rounded-full bg-[#43c394]" />

                      Active

                    </span>

                  </div>

                  <div className="mt-4 rounded-2xl bg-[#faf9fb] p-3">

                    <p className="text-[9px] text-[#9299a8]">
                      Access until
                    </p>

                    <p className="mt-1 text-sm font-black text-[#26334f]">
                      12 September 2027
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeeaf2]">

                      <div className="h-full w-[72%] rounded-full bg-[#ef7897]" />

                    </div>

                    <p className="mt-1 text-right text-[8px] text-[#9ca3b1]">
                      12 months access
                    </p>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">

                    <AccessItem text="Teaching Slides" />

                    <AccessItem text="Worksheets" />

                    <AccessItem text="Flashcards" />

                    <AccessItem text="Digital Games" />

                    <AccessItem text="Modules 1–3" />

                    <AccessItem text="Updates" />

                  </div>

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#f0d8df] bg-[#fff8fa] py-3 text-[10px] font-black text-[#e46f8d] transition hover:bg-[#fff0f4]">
                    Manage Account
                    <ArrowRight size={13} />
                  </button>

                </section>

              </aside>

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          ADD SCHEDULE MODAL
      ===================================================== */}

      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17233f]/30 p-4 backdrop-blur-sm">

          <div className="w-full max-w-[470px] rounded-[30px] bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[9px] font-black tracking-[0.2em] text-[#ef7897]">
                  TEACHER SCHEDULE
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#17233f]">
                  Add Schedule
                </h2>

                <p className="mt-1 text-[10px] text-[#9299a8]">
                  Add your teaching activity for the day.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowScheduleModal(false)
                }
                className="rounded-xl p-2 hover:bg-[#faf7fa]"
              >
                <X size={19} />
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <FormField
                label="Time"
                placeholder="10:00 AM"
                value={newSchedule.time}
                onChange={(value) =>
                  setNewSchedule(
                    (current) => ({
                      ...current,
                      time: value,
                    })
                  )
                }
              />

              <FormField
                label="Activity / Class"
                placeholder="Reading Class — Kad 1"
                value={newSchedule.title}
                onChange={(value) =>
                  setNewSchedule(
                    (current) => ({
                      ...current,
                      title: value,
                    })
                  )
                }
              />

              <FormField
                label="Location"
                placeholder="At Home / Online / Tuition Centre"
                value={newSchedule.location}
                onChange={(value) =>
                  setNewSchedule(
                    (current) => ({
                      ...current,
                      location: value,
                    })
                  )
                }
              />

              <div>

                <label className="mb-1.5 block text-[10px] font-black text-[#4f5a70]">
                  Type
                </label>

                <select
                  value={newSchedule.type}
                  onChange={(e) =>
                    setNewSchedule(
                      (current) => ({
                        ...current,
                        type: e.target
                          .value as ScheduleType,
                      })
                    )
                  }
                  className="w-full rounded-2xl border border-[#e9e5eb] bg-[#fcfbfd] px-4 py-3 text-sm outline-none focus:border-[#ef9ab0]"
                >

                  <option value="reading">
                    Reading Class
                  </option>

                  <option value="prep">
                    Preparation
                  </option>

                  <option value="tuition">
                    Tuition
                  </option>

                  <option value="online">
                    Online Class
                  </option>

                </select>

              </div>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowScheduleModal(false)
                }
                className="flex-1 rounded-full border border-[#e8e3e9] py-3 text-xs font-black text-[#697287]"
              >
                Cancel
              </button>

              <button
                onClick={handleAddSchedule}
                className="flex-1 rounded-full bg-[#ef7897] py-3 text-xs font-black text-white shadow-lg shadow-pink-100"
              >
                Add Schedule
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  arrow = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  arrow?: boolean;
}) {
  return (
    <button
      className={`
        mb-1.5 flex w-full items-center gap-3
        rounded-2xl px-4 py-3.5
        text-left transition
        ${
          active
            ? "bg-gradient-to-r from-[#fff0f4] to-[#fff7f9] text-[#dc5579]"
            : "text-[#536079] hover:bg-[#faf8fa]"
        }
      `}
    >

      <span
        className={
          active
            ? "text-[#dc5579]"
            : "text-[#536079]"
        }
      >
        {icon}
      </span>

      <span
        className={`
          flex-1 text-[12px]
          ${
            active
              ? "font-black"
              : "font-medium"
          }
        `}
      >
        {label}
      </span>

      {arrow && (
        <ChevronRight
          size={14}
          className="text-[#a0a7b5]"
        />
      )}

    </button>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-full border border-white bg-white/95 px-5 py-2.5 text-[10px] font-medium text-[#59657d] shadow-[0_5px_18px_rgba(70,60,80,0.07)] backdrop-blur-sm">
      {text}
    </div>
  );
}

/* =========================================================
   RESOURCE CARD
========================================================= */

function ResourceCard({
  title,
  description,
  button,
  background,
  buttonColor,
  visual,
}: {
  title: string;
  description: ReactNode;
  button: string;
  background: string;
  buttonColor: string;
  visual: ReactNode;
}) {
  return (
    <div
      className={`
        group flex min-h-[285px]
        flex-col rounded-[27px]
        border border-white/80
        bg-gradient-to-br
        ${background}
        p-5
        shadow-[0_8px_22px_rgba(42,36,57,0.035)]
        transition duration-300
        hover:-translate-y-1
        hover:shadow-[0_15px_35px_rgba(42,36,57,0.08)]
      `}
    >

      <div className="flex h-[82px] items-center justify-center">
        {visual}
      </div>

      <div className="flex flex-1 flex-col text-center">

        <h3 className="mt-2 text-[16px] font-normal leading-[1.2] text-[#26334f]">
          {title}
        </h3>

        <p className="mt-3 text-[10px] leading-5 text-[#7b8496]">
          {description}
        </p>

        <button
          className={`
            mt-auto
            flex w-full
            items-center justify-center
            gap-1.5
            rounded-full
            py-3
            text-[11px]
            font-medium
            text-white
            shadow-sm
            transition
            group-hover:shadow-md
            ${buttonColor}
          `}
        >
          {button}
          <ArrowRight size={13} />
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   QUICK CARD
========================================================= */

function QuickCard({
  icon,
  title,
  subtitle,
  background,
}: {
  icon: string;
  title: string;
  subtitle: string;
  background: string;
}) {
  return (
    <button
      className={`
        group flex items-center gap-3
        rounded-2xl ${background}
        p-3.5 text-left
        transition hover:-translate-y-0.5
      `}
    >

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
        {icon}
      </span>

      <span className="min-w-0 flex-1">

        <span className="block truncate text-[11px] font-black text-[#26334f]">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-[9px] text-[#8d95a5]">
          {subtitle}
        </span>

      </span>

      <ChevronRight
        size={14}
        className="text-[#a1a8b6] transition group-hover:translate-x-1"
      />

    </button>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  iconBackground,
  iconColor,
  title,
  action,
}: {
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
  title: string;
  action: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">

      <div className="flex items-center gap-2">

        <div
          className={`
            flex h-9 w-9 items-center
            justify-center rounded-xl
            ${iconBackground}
            ${iconColor}
          `}
        >
          {icon}
        </div>

        <h2 className="text-sm font-black text-[#17233f]">
          {title}
        </h2>

      </div>

      <button className="text-[10px] font-bold text-[#448de0]">
        {action}
      </button>

    </div>
  );
}

/* =========================================================
   RECENT MATERIAL
========================================================= */

function RecentMaterial({
  item,
}: {
  item: RecentItem;
}) {
  const styles = {
    slide: {
      icon: "Aa",
      background: "bg-[#fff0f4]",
      text: "text-[#e56c8b]",
    },

    module: {
      icon: "📖",
      background: "bg-[#eafaf4]",
      text: "text-[#39ae83]",
    },

    worksheet: {
      icon: "📝",
      background: "bg-[#fff6e8]",
      text: "text-[#e49a42]",
    },

    game: {
      icon: "🎮",
      background: "bg-[#eef6ff]",
      text: "text-[#4895dc]",
    },
  };

  const style = styles[item.type];

  return (
    <button className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-[#fcf9fc]">

      <span
        className={`
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          ${style.background}
          ${style.text}
          text-sm font-black
        `}
      >
        {style.icon}
      </span>

      <span className="min-w-0 flex-1">

        <span className="block truncate text-[11px] font-black text-[#26334f]">
          {item.title}
        </span>

        <span className="mt-0.5 block text-[9px] text-[#9aa1b0]">
          {item.activity}
        </span>

      </span>

      <ChevronRight
        size={14}
        className="text-[#b4bac5] transition group-hover:translate-x-1"
      />

    </button>
  );
}

/* =========================================================
   ACCESS ITEM
========================================================= */

function AccessItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-1.5">

      <CheckCircle2
        size={12}
        fill="#43c394"
        className="mt-0.5 shrink-0 text-white"
      />

      <span className="text-[9px] leading-4 text-[#687287]">
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   SCHEDULE STYLE
========================================================= */

function getScheduleStyle(
  type: ScheduleType
) {
  if (type === "reading") {
    return {
      dot: "bg-[#ef7897]",
      time: "bg-[#fff0f4] text-[#e66d8d]",
    };
  }

  if (type === "prep") {
    return {
      dot: "bg-[#43c394]",
      time: "bg-[#eafaf4] text-[#38a77c]",
    };
  }

  if (type === "tuition") {
    return {
      dot: "bg-[#8c71dc]",
      time: "bg-[#f3efff] text-[#7c61ca]",
    };
  }

  return {
    dot: "bg-[#f2a34c]",
    time: "bg-[#fff5e8] text-[#df9138]",
  };
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-black text-[#4f5a70]">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-2xl border border-[#e9e5eb] bg-[#fcfbfd] px-4 py-3 text-sm outline-none focus:border-[#ef9ab0]"
      />

    </div>
  );
}